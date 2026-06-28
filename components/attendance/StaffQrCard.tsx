"use client";

import { useCallback, useEffect, useState } from "react";
import { QrCode, RefreshCw, AlertCircle, Info, LogIn, LogOut } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";

type Mode = "in" | "out";

/**
 * Personel QR Paneli — bugüne özel imzalı GİRİŞ ve ÇIKIŞ QR'larını gösterir.
 * Personel "Giriş" (yeşil) veya "Çıkış" (kırmızı) seçer; ilgili QR okutulur.
 * QR günlük yenilenir; ekran görüntüsü ertesi gün geçersizdir.
 */
export function StaffQrCard() {
  const { user, firebaseReady } = useAuth();
  const t = useT();
  const [qrIn, setQrIn] = useState<string | null>(null);
  const [qrOut, setQrOut] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [mode, setMode] = useState<Mode>("in");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

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
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setQrIn(data.qrIn);
      setQrOut(data.qrOut);
      setDate(data.date);
    } catch (e) {
      setError(true);
      setErrorMsg(String((e as Error)?.message ?? e));
      setQrIn(null);
      setQrOut(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (firebaseReady && user) void load();
  }, [firebaseReady, user, load]);

  const isIn = mode === "in";
  const activeQr = isIn ? qrIn : qrOut;

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

      {/* Giriş / Çıkış seçimi */}
      <div className="mb-5 grid w-full grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode("in")}
          className={[
            "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition",
            isIn
              ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40"
              : "border-overlay/10 bg-overlay/[0.03] text-muted hover:text-content",
          ].join(" ")}
        >
          <LogIn size={16} aria-hidden="true" /> {t("att.myqr.entry")}
        </button>
        <button
          type="button"
          onClick={() => setMode("out")}
          className={[
            "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition",
            !isIn
              ? "border-rose-400/50 bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/40"
              : "border-overlay/10 bg-overlay/[0.03] text-muted hover:text-content",
          ].join(" ")}
        >
          <LogOut size={16} aria-hidden="true" /> {t("att.myqr.exit")}
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-sm text-muted">{t("att.myqr.loading")}</p>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="flex items-center gap-2 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" /> {t("att.myqr.error")}
          </p>
          {errorMsg && <p className="max-w-xs text-xs text-muted/70">{errorMsg}</p>}
        </div>
      ) : activeQr ? (
        <>
          <div
            className={`rounded-2xl border-4 bg-white p-4 ${
              isIn ? "border-emerald-400" : "border-rose-400"
            }`}
          >
            <QRCodeSVG
              value={activeQr}
              size={220}
              level="M"
              marginSize={0}
              fgColor={isIn ? "#047857" : "#be123c"}
              aria-label={isIn ? t("att.myqr.entryQrTitle") : t("att.myqr.exitQrTitle")}
            />
          </div>
          <p className={`mt-3 text-sm font-bold ${isIn ? "text-emerald-300" : "text-rose-300"}`}>
            {isIn ? t("att.myqr.entryQrTitle") : t("att.myqr.exitQrTitle")}
          </p>
          <p className="mt-1 text-xs text-muted">{isIn ? t("att.myqr.entryHint") : t("att.myqr.exitHint")}</p>
          <p className="mt-1 text-xs font-medium text-accent">{t("att.myqr.validFor", { date })}</p>
        </>
      ) : null}

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-overlay/10 bg-overlay/[0.03] px-3 py-2 text-left text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        {t("att.myqr.howto")}
      </p>
    </GlassCard>
  );
}
