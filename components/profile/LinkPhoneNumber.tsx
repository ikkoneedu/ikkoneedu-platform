"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  RecaptchaVerifier,
  linkWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateMyProfile } from "@/lib/services/user-profile";
import { toE164Turkey } from "@/lib/auth/phone";
import { TextField } from "@/components/shared/TextField";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useT } from "@/components/i18n/LocaleProvider";

/** reCAPTCHA konteyner id'si (login formununkinden farklı — çakışma olmasın). */
const RECAPTCHA_ID = "recaptcha-link-phone";

/**
 * Profil sayfasında telefon doğrulama/bağlama — zaten giriş yapmış kullanıcı,
 * `linkWithPhoneNumber` ile telefonunu KENDİ hesabına bağlar (görünmez
 * reCAPTCHA + SMS kodu). Başarılı olunca `users/{uid}` içinde `phone` +
 * `phoneVerified: true` güncellenir; böylece kullanıcı sonradan telefonla da
 * giriş yapabilir.
 */
export function LinkPhoneNumber() {
  const t = useT();
  const { user, profile, refreshProfile, firebaseReady } = useAuth();
  const [phase, setPhase] = useState<"idle" | "code">("idle");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const e164Ref = useRef<string | null>(null);

  const verified = profile?.phoneVerified === true;

  const clearVerifier = useCallback(() => {
    try {
      verifierRef.current?.clear();
    } catch {
      /* yok say */
    }
    verifierRef.current = null;
  }, []);

  const mapError = useCallback(
    (e: unknown): string => {
      const c = String((e as { code?: string })?.code ?? "");
      if (c.includes("credential-already-in-use") || c.includes("account-exists"))
        return t("linkPhone.alreadyInUse");
      if (c.includes("invalid-phone-number")) return t("linkPhone.invalid");
      return t("linkPhone.unavailable");
    },
    [t],
  );

  const handleSend = useCallback(async () => {
    if (busy || !user || !auth) {
      if (!auth) setError(t("linkPhone.unavailable"));
      return;
    }
    const e164 = toE164Turkey(phone);
    if (!e164) {
      setError(t("linkPhone.invalid"));
      return;
    }
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      clearVerifier();
      const verifier = new RecaptchaVerifier(auth, RECAPTCHA_ID, { size: "invisible" });
      verifierRef.current = verifier;
      e164Ref.current = e164;
      confirmationRef.current = await linkWithPhoneNumber(user, e164, verifier);
      setPhase("code");
    } catch (e) {
      setError(mapError(e));
      clearVerifier();
    } finally {
      setBusy(false);
    }
  }, [busy, user, phone, t, clearVerifier, mapError]);

  const handleConfirm = useCallback(async () => {
    if (busy || !user || !confirmationRef.current) return;
    setBusy(true);
    setError(null);
    try {
      await confirmationRef.current.confirm(code.trim());
      clearVerifier();
      await updateMyProfile(user.uid, {
        phone: e164Ref.current ?? phone,
        phoneVerified: true,
      });
      await refreshProfile();
      setPhase("idle");
      setCode("");
      setDone(true);
    } catch (e) {
      setError(mapError(e));
    } finally {
      setBusy(false);
    }
  }, [busy, user, code, phone, refreshProfile, clearVerifier, mapError]);

  const handleChangeNumber = useCallback(() => {
    setPhase("idle");
    setCode("");
    setError(null);
    confirmationRef.current = null;
    clearVerifier();
  }, [clearVerifier]);

  // Firebase bağlı değilse (Mock Mod) doğrulama yapılamaz — bileşeni gizle.
  if (!firebaseReady) return null;

  return (
    <div className="mt-4 rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-accent" aria-hidden="true" />
          <span className="text-sm font-semibold text-content">{t("linkPhone.title")}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            verified
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
              : "border-amber-400/30 bg-amber-400/10 text-amber-400"
          }`}
        >
          {verified ? <CheckCircle2 size={12} aria-hidden="true" /> : <AlertCircle size={12} aria-hidden="true" />}
          {verified ? t("linkPhone.verified") : t("linkPhone.notVerified")}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-muted">{t("linkPhone.desc")}</p>

      <div className="mt-4 space-y-3">
        {phase === "idle" ? (
          <>
            <TextField
              label={t("linkPhone.phoneLabel")}
              name="linkPhone"
              type="tel"
              icon={Phone}
              placeholder={t("linkPhone.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              disabled={busy}
            />
            <PrimaryButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleSend()}
              disabled={busy}
            >
              {busy ? t("linkPhone.sending") : t("linkPhone.send")}
            </PrimaryButton>
          </>
        ) : (
          <>
            <TextField
              label={t("linkPhone.codeLabel")}
              name="linkSmsCode"
              icon={MessageSquare}
              placeholder="000000"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="one-time-code"
              disabled={busy}
            />
            <div className="flex items-center gap-3">
              <PrimaryButton
                type="button"
                size="sm"
                onClick={() => void handleConfirm()}
                disabled={busy || code.length < 6}
              >
                {busy ? t("linkPhone.confirming") : t("linkPhone.confirm")}
              </PrimaryButton>
              <button
                type="button"
                onClick={handleChangeNumber}
                className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-content disabled:opacity-50"
                disabled={busy}
              >
                <ArrowLeft size={14} aria-hidden="true" />
                {t("linkPhone.change")}
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs text-brand">
            <AlertCircle size={14} aria-hidden="true" />
            {error}
          </p>
        )}
        {done && (
          <p className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-400">
            <CheckCircle2 size={14} aria-hidden="true" />
            {t("linkPhone.success")}
          </p>
        )}
      </div>

      {/* Görünmez reCAPTCHA konteyneri */}
      <div id={RECAPTCHA_ID} />
    </div>
  );
}
