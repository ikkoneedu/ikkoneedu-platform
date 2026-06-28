import { NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { generateText, firstAvailableProvider } from "@/lib/ai/providers";
import { getAgent } from "@/lib/ai/registry";

export const runtime = "nodejs";

/**
 * Gerçek AI metin üretimi — registry'deki ajana göre sağlayıcı seçer
 * (Anthropic/OpenAI/Gemini; anahtarı olan ilk tercih). Hiçbiri yoksa
 * { ok:false, demo:true } → istemci demo'ya düşer (sıfır maliyet).
 *
 * İstek (POST): { idToken, agent?: <agentId>, kind?: 'chat'|'reportCard', prompt }
 */
const KIND_TO_AGENT: Record<string, string> = {
  chat: "okul-beyni",
  reportCard: "karne",
};

export async function POST(request: Request) {
  try {
    let body: { idToken?: string; agent?: string; kind?: string; prompt?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
    }

    const agentId = body.agent || KIND_TO_AGENT[String(body.kind ?? "")] || "okul-beyni";
    const agent = getAgent(agentId);
    if (!agent || agent.capability === "image") {
      return NextResponse.json({ ok: false, error: "Geçersiz ajan." }, { status: 400 });
    }
    const prompt = String(body.prompt ?? "").slice(0, 6000);
    if (!prompt) {
      return NextResponse.json({ ok: false, error: "Boş istek." }, { status: 400 });
    }

    const provider = firstAvailableProvider(agent.providerPrefs);
    if (!provider) {
      // Hiçbir sağlayıcının anahtarı yok → demo.
      return NextResponse.json({ ok: false, demo: true, agent: agent.id }, { status: 200 });
    }

    // Yetki: giriş yapmış kullanıcı (admin doğrulaması varsa). Anahtarı korur.
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

    const model = agent.models[provider] ?? "";
    const text = await generateText(provider, {
      system: agent.systemPrompt,
      prompt,
      model,
      maxTokens: agent.capability === "chat" ? 800 : 500,
    });
    return NextResponse.json({ ok: true, text, provider, agent: agent.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `AI hatası: ${String((e as Error)?.message ?? e)}` },
      { status: 200 },
    );
  }
}
