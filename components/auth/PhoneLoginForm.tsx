"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { Phone, ArrowRight, ArrowLeft, MessageSquare, AlertCircle } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { TextField } from "@/components/shared/TextField";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useT } from "@/components/i18n/LocaleProvider";
import { toE164Turkey } from "@/lib/auth/phone";

/** reCAPTCHA konteyner id'si — Firebase Phone Auth zorunlu kılar (invisible). */
const RECAPTCHA_ID = "recaptcha-phone-login";

interface PhoneLoginFormProps {
  /**
   * Numara + SMS kodu doğrulandıktan sonra çağrılır. Profil okuma, yetki
   * kontrolü ve yönlendirme üst bileşende (login sayfası) yapılır. Telefonla
   * girişte SMS kodu 2. faktör kabul edildiğinden e-posta OTP adımı UYGULANMAZ.
   */
  onAuthenticated: (user: User) => Promise<void> | void;
  /** Firebase bağlı değilse (Mock Mod) form pasifleştirilir. */
  disabled?: boolean;
}

/**
 * Telefonla (SMS) giriş formu — `/login` sayfasındaki "Telefon" sekmesi.
 *
 * Adım 1: numara → `signInWithPhoneNumber` (görünmez reCAPTCHA) → SMS gönderilir.
 * Adım 2: SMS kodu → `confirm()` → `onAuthenticated(user)`.
 *
 * Numara mevcut bir hesaba bağlıysa (profil sayfasından `linkWithPhoneNumber`
 * ile) o hesaba giriş yapılır; bağlı değilse üst bileşen "profil yok" akışını
 * gösterip oturumu kapatır.
 */
export function PhoneLoginForm({ onAuthenticated, disabled }: PhoneLoginFormProps) {
  const t = useT();
  const [phase, setPhase] = useState<"number" | "code">("number");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const clearVerifier = useCallback(() => {
    try {
      verifierRef.current?.clear();
    } catch {
      /* zaten temizlenmişse yok say */
    }
    verifierRef.current = null;
  }, []);

  const mapError = useCallback(
    (e: unknown): string => {
      const c = String((e as { code?: string })?.code ?? "");
      if (c.includes("operation-not-allowed") || c.includes("billing-not-enabled"))
        return t("login.phoneNotEnabled");
      if (c.includes("invalid-phone-number")) return t("login.phoneInvalid");
      if (c.includes("invalid-verification-code") || c.includes("code-expired"))
        return t("login.phoneCodeError");
      return t("login.phoneUnavailable");
    },
    [t],
  );

  const handleSend = useCallback(async () => {
    if (busy) return;
    if (!auth) {
      setError(t("login.phoneUnavailable"));
      return;
    }
    const e164 = toE164Turkey(phone);
    if (!e164) {
      setError(t("login.phoneInvalid"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      clearVerifier();
      const verifier = new RecaptchaVerifier(auth, RECAPTCHA_ID, { size: "invisible" });
      verifierRef.current = verifier;
      confirmationRef.current = await signInWithPhoneNumber(auth, e164, verifier);
      setPhase("code");
    } catch (e) {
      setError(mapError(e));
      clearVerifier();
    } finally {
      setBusy(false);
    }
  }, [busy, phone, t, clearVerifier, mapError]);

  const handleConfirm = useCallback(async () => {
    if (busy || !confirmationRef.current) return;
    setBusy(true);
    setError(null);
    try {
      const cred = await confirmationRef.current.confirm(code.trim());
      clearVerifier();
      await onAuthenticated(cred.user);
    } catch (e) {
      setError(mapError(e));
      setBusy(false);
    }
  }, [busy, code, onAuthenticated, clearVerifier, mapError]);

  const handleChangeNumber = useCallback(() => {
    setPhase("number");
    setCode("");
    setError(null);
    confirmationRef.current = null;
    clearVerifier();
  }, [clearVerifier]);

  return (
    <div className="space-y-4">
      {phase === "number" ? (
        <>
          <TextField
            label={t("login.phoneLabel")}
            name="phone"
            type="tel"
            icon={Phone}
            placeholder={t("login.phonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            disabled={disabled || busy}
          />
          <p className="text-xs text-muted">{t("login.phoneHint")}</p>
          {error && <ErrorLine>{error}</ErrorLine>}
          <PrimaryButton
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void handleSend()}
            disabled={disabled || busy}
          >
            {busy ? t("login.phoneSending") : t("login.phoneSend")}
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </>
      ) : (
        <>
          <TextField
            label={t("login.phoneCodeLabel")}
            name="smsCode"
            icon={MessageSquare}
            placeholder="000000"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoComplete="one-time-code"
            disabled={busy}
          />
          {error && <ErrorLine>{error}</ErrorLine>}
          <PrimaryButton
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void handleConfirm()}
            disabled={busy || code.length < 6}
          >
            {busy ? t("login.phoneVerifying") : t("login.phoneVerify")}
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
          <button
            type="button"
            onClick={handleChangeNumber}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-muted transition-colors hover:text-content disabled:opacity-50"
            disabled={busy}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {t("login.phoneChange")}
          </button>
        </>
      )}
      {/* Görünmez reCAPTCHA konteyneri */}
      <div id={RECAPTCHA_ID} />
    </div>
  );
}

function ErrorLine({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
      <AlertCircle size={16} aria-hidden="true" />
      {children}
    </p>
  );
}
