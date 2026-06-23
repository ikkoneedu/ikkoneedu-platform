import { NextResponse } from "next/server";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * Halka açık bursluluk SINAV GİRİŞ BELGESİ sorgusu — DOĞRULAYICILI.
 *
 * Güvenlik: belge yalnızca başvuru numarası + doğrulayıcı (TC veya veli telefonu)
 * birlikte doğrulandığında döner. Başvuru no'yu tahmin/iterasyon ile başkasının
 * giriş belgesi görüntülenemez. Başvuru belgesi halka açık DEĞİL; okuma Admin SDK
 * ile (kuralları aşarak) yalnızca bu route'tan yapılır.
 *
 * İstek (POST): { slug, applicationNo, verifier }
 * Yanıt: { ok, card? } veya hata. Sonuç (puan/burs) DÖNMEZ — yalnızca sınav
 * oturum bilgisi (salon/sıra) ve aday adı döner.
 */

function digitsOnly(s: string): string {
  return (s || "").replace(/\D/g, "");
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Giriş belgesi servisi şu anda kullanılamıyor." },
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

    // Salon/sıra bilgisi başvuru belgesinde veya yayımlanmış sonuçta olabilir.
    let room = String(app.room ?? "");
    let seatNo = String(app.seatNo ?? "");
    if (!room || !seatNo) {
      const resSnap = await db
        .doc(`tenants/${tenantId}/scholarshipResults/${applicationNo}`)
        .get();
      if (resSnap.exists) {
        const r = resSnap.data() ?? {};
        room = room || String(r.room ?? "");
        seatNo = seatNo || String(r.seatNo ?? "");
      }
    }

    // Sınav oturum meta verisi (tarih/saat/kampüs) — tenant ayarlarından (varsa).
    let examName = "";
    let examDate = "";
    let examTime = "";
    let campus = "";
    const settingsSnap = await db
      .doc(`tenants/${tenantId}/settings/scholarshipExam`)
      .get();
    if (settingsSnap.exists) {
      const s = settingsSnap.data() ?? {};
      examName = String(s.examName ?? s.name ?? "");
      examDate = String(s.examDate ?? "");
      examTime = String(s.examTime ?? "");
      campus = String(s.campus ?? "");
    }

    return NextResponse.json({
      ok: true,
      card: {
        applicationNo,
        studentName: String(app.studentName ?? ""),
        room,
        seatNo,
        examName,
        examDate,
        examTime,
        campus,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Sorgu sırasında bir hata oluştu." },
      { status: 500 },
    );
  }
}
