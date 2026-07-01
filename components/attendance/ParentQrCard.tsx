"use client";

import { useCallback, useEffect, useState } from "react";
import { QrCode, RefreshCw, AlertCircle, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";

/**
 * Veli QR Kartı — okul yılı boyunca SABİT kalan tek bir QR gösterir.
 * Okul girişinde okutulduğunda öğrenci(ler)in otomatik yoklaması alınır;
 * ikinci okutmada "velisi tarafından bekleniyor" durumuna geçer (bkz.
 * `/api/attendance/student-scan`). Personelin günlük giriş/çıkış QR
 * çiftinden farklı olarak burada tek, uzun ömürlü bir QR vardır.
 */
export function ParentQrCard() {
  const { user, firebaseReady, profile } = useAuth();
  const t = useT();
  const [qr, setQr] = useState<string | null>(null);
  const [expiresDate, setExpiresDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/attendance/parent-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setQr(data.qr);
      setExpiresDate(data.expiresDate);
    } catch (e) {
      setError(true);
      setErrorMsg(String((e as Error)?.message ?? e));
      setQr(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (firebaseReady && user && profile?.role === "PARENT") void load();
  }, [firebaseReady, user, profile?.role, load]);

  if (!firebaseReady || profile?.role !== "PARENT") return null;

  return (
    <GlassCard tone="navy" className="mx-auto flex max-w-md flex-col items-center text-center">
      <div className="mb-3 flex items-center gap-2 self-stretch">
        <QrCode size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("att.parentqr.title")}</h2>
        <button
          type="button"
          onClick={() => void load()}
          className="ml-auto text-muted transition hover:text-content"
          aria-label={t("att.parentqr.refresh")}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <p className="mb-4 text-sm text-muted">{t("att.parentqr.desc")}</p>

      {loading ? (
        <p className="py-10 text-sm text-muted">{t("att.parentqr.loading")}</p>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="flex items-center gap-2 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" /> {t("att.parentqr.error")}
          </p>
          {errorMsg && <p className="max-w-xs text-xs text-muted/70">{errorMsg}</p>}
        </div>
      ) : qr ? (
        <>
          <div className="w-full max-w-[320px] rounded-2xl border-4 border-accent bg-white p-3 sm:p-4">
            <QRCodeSVG
              value={qr}
              size={512}
              level="M"
              marginSize={0}
              className="h-auto w-full"
              aria-label={t("att.parentqr.title")}
            />
          </div>
          <p className="mt-3 text-xs font-medium text-accent">
            {t("att.parentqr.validUntil", { date: expiresDate })}
          </p>
        </>
      ) : null}

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-overlay/10 bg-overlay/[0.03] px-3 py-2 text-left text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        {t("att.parentqr.howto")}
      </p>
    </GlassCard>
  );
}
