import { NextResponse } from "next/server";
import { generateText, firstAvailableProvider } from "@/lib/ai/providers";
import { getAgent } from "@/lib/ai/registry";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Günlük zamanlanmış görev (Vercel Cron — vercel.json: her gün 03:00 UTC).
 *
 * Güvenlik: Vercel'in eklediği `Authorization: Bearer <CRON_SECRET>` başlığı
 * doğrulanır. Production'da CRON_SECRET zorunludur; development'da tanımsızsa
 * çalışır ama AI/yazma yapmaz.
 *
 * Hazırlık iskeleti: "Yazılım Moderatör" ajanı, anahtar varsa günlük bir sistem
 * özeti üretir. İleride buraya: okul beyni öğrenme/özet, devamsızlık digest'i,
 * QR/log temizliği, bildirim üretimi eklenebilir.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET production ortamında zorunludur." },
      { status: 503 },
    );
  }

  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Yetkisiz." }, { status: 401 });
    }
  }

  const tasks: Record<string, unknown> = { ranAt: new Date().toISOString() };

  // Yazılım moderatörü — anahtar varsa kısa bir günlük özet üret (demo-safe).
  const agent = getAgent("yazilim-moderator");
  const provider = agent ? firstAvailableProvider(agent.providerPrefs) : null;
  if (agent && provider && secret) {
    try {
      tasks.summary = await generateText(provider, {
        system: agent.systemPrompt,
        prompt:
          "Bugünkü sistem durumu için kısa bir kontrol listesi üret: giriş-çıkış, başvurular, mesajlaşma sağlığı. 4-5 madde, Türkçe.",
        model: agent.models[provider] ?? "",
        maxTokens: 300,
      });
      tasks.provider = provider;
    } catch (e) {
      tasks.summaryError = String((e as Error)?.message ?? e);
    }
  } else {
    tasks.summary = "skipped (AI anahtarı veya CRON_SECRET yok)";
  }

  return NextResponse.json({ ok: true, tasks });
}
