import { NextResponse } from "next/server";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { generateAi, hasAiKey } from "@/lib/ai/anthropic";

export const runtime = "nodejs";

/**
 * Gerçek AI üretim ucu (Claude). ANTHROPIC_API_KEY tanımlıysa gerçek yanıt;
 * yoksa { ok:false, demo:true } döner → istemci demo'ya düşer (sıfır maliyet).
 *
 * İstek (POST): { idToken, kind: 'chat'|'reportCard', prompt }
 */
const SYSTEMS: Record<string, string> = {
  chat: "Sen IKK ONE EDU okul yönetim platformunun kurumsal yapay zekâ asistanısın. Türkçe, kısa, profesyonel ve uygulanabilir yanıt ver. Eğitim ve okul operasyonları bağlamında kal; emin olmadığında varsayım yapma.",
  reportCard:
    "Sen deneyimli bir öğretmensin. Verilen öğrenci performansına göre KISA (3-5 cümle), pedagojik, kişiselleştirilmiş ve kurumsal bir karne yorumu yaz. Türkçe yaz; abartı ve klişeden kaçın.",
};

export async function POST(request: Request) {
  try {
    if (!hasAiKey()) {
      return NextResponse.json({ ok: false, demo: true }, { status: 200 });
    }
    let body: { idToken?: string; kind?: string; prompt?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
    }
    const idToken = String(body.idToken ?? "");
    const kind = String(body.kind ?? "chat");
    const prompt = String(body.prompt ?? "").slice(0, 4000);
    if (!prompt) {
      return NextResponse.json({ ok: false, error: "Boş istek." }, { status: 400 });
    }

    // Yetki: giriş yapmış kullanıcı (admin doğrulaması varsa). API anahtarını korur.
    if (isAdminConfigured()) {
      const auth = getAdminAuth();
      if (auth) {
        try {
          await auth.verifyIdToken(idToken);
        } catch {
          return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
        }
      }
    }

    const system = SYSTEMS[kind] ?? SYSTEMS.chat;
    const text = await generateAi(system, prompt, kind === "reportCard" ? 400 : 700);
    return NextResponse.json({ ok: true, text });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `AI hatası: ${String((e as Error)?.message ?? e)}` },
      { status: 200 },
    );
  }
}
