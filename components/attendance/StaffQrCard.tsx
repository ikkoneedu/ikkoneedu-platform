"use client";

import { useCallback, useEffect, useState } from "react";
import { QrCode, RefreshCw, AlertCircle, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";

/**
 * Personel QR Kartı — bugüne özel imzalı QR'ı sunucudan alır ve gösterir.
 * QR günlük yenilenir; ekran görüntüsü ertesi gün geçersizdir.
 */
export function StaffQrCard() {
  const { user, firebaseReady } = useAuth();
  const t = useT();
  const [qr, setQr] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/attendance/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "error");
      setQr(data.qr);
      setDate(data.date);
    } catch {
      setError(true);
      setQr(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (firebaseReady && user) void load();
  }, [firebaseReady, user, load]);

  return (
    <GlassCard tone="navy" className="mx-auto flex max-w-md flex-col items-center text-center">
      <div className="mb-3 flex items-center gap-2 self-stretch">
        <QrCode size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("att.myqr.title")}</h2>
        <button
          type="button"
          onClick={() => void load()}
          className="ml-auto text-muted transition hover:text-content"
          aria-label={t("att.myqr.refresh")}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <p className="mb-4 text-sm text-muted">{t("att.myqr.desc")}</p>

      {loading ? (
        <p className="py-10 text-sm text-muted">{t("att.myqr.loading")}</p>
      ) : error ? (
        <p className="flex items-center gap-2 py-10 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {t("att.myqr.error")}
        </p>
      ) : qr ? (
        <>
          <div className="rounded-2xl bg-white p-4">
            <QRCodeSVG value={qr} size={220} level="M" marginSize={0} aria-label={t("att.myqr.title")} />
          </div>
          <p className="mt-3 text-xs font-medium text-accent">
            {t("att.myqr.validFor", { date })}
          </p>
        </>
      ) : null}

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-overlay/10 bg-overlay/[0.03] px-3 py-2 text-left text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        {t("att.myqr.howto")}
      </p>
    </GlassCard>
  );
}
