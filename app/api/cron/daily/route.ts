import { NextResponse } from "next/server";
import { generateText, firstAvailableProvider } from "@/lib/ai/providers";
import { getAgent } from "@/lib/ai/registry";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { dateStr } from "@/lib/attendance/token";
import { notifyGeneralManagers } from "@/lib/server/tenant-leadership-admin";

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

  // Günlük giriş-çıkış özeti → yalnız Genel Müdüre (kişisel bildirim).
  // Idempotent: aynı gün için tenant başına bir kez üretilir (dailyReports kaydı).
  if (secret && isAdminConfigured()) {
    try {
      tasks.dailyReports = await sendDailyReportsToGeneralManagers();
    } catch (e) {
      tasks.dailyReportsError = String((e as Error)?.message ?? e);
    }
  }

  return NextResponse.json({ ok: true, tasks });
}

/** Tamamlanmış okul gününün (dün, İstanbul saati) devam özetini Genel Müdürlere gönderir. */
async function sendDailyReportsToGeneralManagers(): Promise<number> {
  const adminDb = getAdminDb();
  if (!adminDb) return 0;
  const reportDate = dateStr(Date.now() - 24 * 60 * 60 * 1000);

  const tenantsSnap = await adminDb.collection("tenants").get();
  let sent = 0;
  for (const tenantDoc of tenantsSnap.docs) {
    const tenantId = tenantDoc.id;
    const status = String(tenantDoc.data()?.status ?? "").toLowerCase();
    if (status === "suspended" || status === "cancelled") continue;

    // Tekilleştirme: bu tenant + gün için daha önce gönderildiyse atla.
    const reportRef = adminDb.doc(`tenants/${tenantId}/dailyReports/${reportDate}`);
    if ((await reportRef.get()).exists) continue;

    const logsSnap = await adminDb
      .collection(`tenants/${tenantId}/attendanceLogs`)
      .where("date", "==", reportDate)
      .get();
    if (logsSnap.empty) continue; // o gün hiç kayıt yoksa (tatil vb.) bildirim atma

    let lateCount = 0;
    let missingCheckOut = 0;
    for (const doc of logsSnap.docs) {
      const d = doc.data();
      if (d.late) lateCount += 1;
      if (d.checkIn && !d.checkOut) missingCheckOut += 1;
    }

    await notifyGeneralManagers(adminDb, tenantId, {
      title: `Günlük devam özeti · ${reportDate}`,
      body: `${logsSnap.size} personel giriş yaptı, ${lateCount} geç kaldı, ${missingCheckOut} kişi çıkış okutmadı.`,
      type: "system",
      link: "/attendance/logs",
    });
    await reportRef.set({
      date: reportDate,
      totalCheckIns: logsSnap.size,
      lateCount,
      missingCheckOut,
      sentAt: new Date(),
    });
    sent += 1;
  }
  return sent;
}
