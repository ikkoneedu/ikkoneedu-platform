"use client";

import { useState, type FormEvent } from "react";
import { ShieldCheck, ArrowRight, AlertCircle, RotateCcw } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useT } from "@/components/i18n/LocaleProvider";

interface OtpStepProps {
  email: string;
  submitting: boolean;
  error: string | null;
  resendState: "idle" | "sending" | "sent" | "cooldown";
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
}

/**
 * E-posta girişinin ikinci adımı — şifre doğrulandıktan sonra kullanıcının
 * e-postasına gönderilen 6 haneli kodu ister. Bkz. `/api/auth/send-otp`,
 * `/api/auth/verify-otp`.
 */
export function OtpStep({
  email,
  submitting,
  error,
  resendState,
  onSubmit,
  onResend,
  onBack,
}: OtpStepProps) {
  const t = useT();
  const [code, setCode] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim().length === 6) onSubmit(code.trim());
  };

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        <ShieldCheck size={14} aria-hidden="true" />
        {t("login.otpBadge")}
      </span>
      <h2 className="mt-4 text-xl font-bold tracking-tight text-content sm:text-2xl">
        {t("login.otpTitle")}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {t("login.otpDesc", { email })}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextField
          label={t("login.otpCodeLabel")}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="text-center text-lg tracking-[0.5em]"
          required
        />

        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        <PrimaryButton
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting || code.trim().length !== 6}
        >
          {submitting ? t("login.otpVerifying") : t("login.otpSubmit")}
          <ArrowRight size={18} aria-hidden="true" />
        </PrimaryButton>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-muted transition-colors hover:text-content"
        >
          {t("login.otpBack")}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={resendState === "sending" || resendState === "cooldown"}
          className="inline-flex items-center gap-1.5 font-medium text-accent transition-colors hover:text-content disabled:opacity-50"
        >
          <RotateCcw size={13} aria-hidden="true" />
          {resendState === "sending"
            ? t("login.otpResending")
            : resendState === "sent"
              ? t("login.otpResent")
              : t("login.otpResend")}
        </button>
      </div>
    </div>
  );
}
