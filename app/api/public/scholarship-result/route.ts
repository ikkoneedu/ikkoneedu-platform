import { NextResponse } from "next/server";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * Halka açık bursluluk SONUÇ sorgusu — DOĞRULAYICILI.
 *
 * Güvenlik: sonuç yalnızca başvuru numarası + doğrulayıcı (TC veya veli telefonu)
 * birlikte doğrulandığında döner. Böylece başvuru no'yu tahmin/iterasyon ile
 * başkasının sonucu görüntülenemez. Sonuç belgesi artık halka açık DEĞİL;
 * okuma Admin SDK ile (kuralları aşarak) yalnızca bu route'tan yapılır.
 *
 * İstek (POST): { slug, applicationNo, verifier }
 * Yanıt: { ok, published, result? } veya hata.
 */

function digitsOnly(s: string): string {
  return (s || "").replace(/\D/g, "");
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Sonuç sorgu servisi şu anda kullanılamıyor." },
      { status: 503 },
    );
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { ok: false, error: "Servis kullanılamıyor." },
      { status: 503 },
    );
  }

  let body: { slug?: string; applicationNo?: string; verifier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const tenantId = String(body.slug ?? "").trim();
  const applicationNo = String(body.applicationNo ?? "").trim();
  const verifier = String(body.verifier ?? "").trim();

  if (!tenantId || !applicationNo || !verifier) {
    return NextResponse.json(
      { ok: false, error: "Başvuru numarası ve doğrulama bilgisi gereklidir." },
      { status: 400 },
    );
  }
  // Genel "bulunamadı" yanıtı — başvuru var/yok bilgisini sızdırmamak için
  // doğrulama hatası ile aynı mesaj kullanılır.
  const notFound = NextResponse.json(
    { ok: false, error: "Kayıt bulunamadı veya doğrulama bilgisi hatalı." },
    { status: 404 },
  );

  try {
    const appRef = db.doc(
      `tenants/${tenantId}/scholarshipApplications/${applicationNo}`,
    );
    const appSnap = await appRef.get();
    if (!appSnap.exists) return notFound;
    const app = appSnap.data() ?? {};

    // Doğrulayıcı: TC (tam eşleşme) VEYA veli telefonu (rakam bazlı eşleşme).
    const tc = String(app.studentTc ?? "");
    const phone = digitsOnly(String(app.parentPhone ?? ""));
    const vDigits = digitsOnly(verifier);
    const matches =
      (tc.length > 0 && verifier === tc) ||
      (phone.length >= 7 && vDigits.length >= 7 && phone === vDigits);
    if (!matches) return notFound;

    const resRef = db.doc(`tenants/${tenantId}/scholarshipResults/${applicationNo}`);
    const resSnap = await resRef.get();
    if (!resSnap.exists) {
      return NextResponse.json({ ok: true, published: false });
    }
    const r = resSnap.data() ?? {};
    // Yalnızca minimal, sonuç alanları döner (hassas başvuru verisi DÖNMEZ).
    return NextResponse.json({
      ok: true,
      published: true,
      result: {
        applicationNo,
        studentName: String(r.studentName ?? app.studentName ?? ""),
        examScore: String(r.examScore ?? ""),
        scholarshipRate: String(r.scholarshipRate ?? ""),
        status: String(r.status ?? ""),
        room: String(r.room ?? ""),
        seatNo: String(r.seatNo ?? ""),
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Sorgu sırasında bir hata oluştu." },
      { status: 500 },
    );
  }
}
