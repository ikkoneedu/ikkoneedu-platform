import { NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { generateImage, firstAvailableProvider } from "@/lib/ai/providers";
import { getAgent } from "@/lib/ai/registry";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Gerçek AI GÖRSEL üretimi (OpenAI gpt-image / Gemini Imagen). Registry'deki
 * görsel ajanına göre sağlayıcı seçilir. Anahtar yoksa { ok:false, demo:true }.
 *
 * İstek (POST): { idToken, agent?: 'sosyal-gorsel'|'sertifika-gorsel', prompt, size? }
 * Yanıt: { ok, image: dataUri } veya { ok, url }
 */
export async function POST(request: Request) {
  try {
    let body: { idToken?: string; agent?: string; prompt?: string; size?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
    }
    const agent = getAgent(body.agent || "sosyal-gorsel");
    if (!agent || agent.capability !== "image") {
      return NextResponse.json({ ok: false, error: "Geçersiz görsel ajanı." }, { status: 400 });
    }
    const prompt = String(body.prompt ?? "").slice(0, 2000);
    if (!prompt) {
      return NextResponse.json({ ok: false, error: "Boş istek." }, { status: 400 });
    }

    const provider = firstAvailableProvider(agent.providerPrefs);
    if (!provider) {
      return NextResponse.json({ ok: false, demo: true, agent: agent.id }, { status: 200 });
    }

    if (isAdminConfigured()) {
      const auth = getAdminAuth();
      if (auth) {
        try {
          await auth.verifyIdToken(String(body.idToken ?? ""));
        } catch {
          return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
        }
      }
    }

    const full = `${agent.systemPrompt} ${prompt}`.trim();
    const result = await generateImage(provider, { prompt: full, size: body.size });
    if (result.b64) {
      return NextResponse.json({ ok: true, image: `data:image/png;base64,${result.b64}`, provider });
    }
    if (result.url) {
      return NextResponse.json({ ok: true, url: result.url, provider });
    }
    return NextResponse.json({ ok: false, error: "Görsel üretilemedi." }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Görsel hatası: ${String((e as Error)?.message ?? e)}` },
      { status: 200 },
    );
  }
}
