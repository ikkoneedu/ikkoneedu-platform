"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, AlertCircle, Award } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { productName, productFullName } from "@/lib/constants";

/**
 * Halk (genel kullanıcı) açık kayıt ekranı.
 * Yalnızca PUBLIC rolü oluşturur; başarılı kayıt sonrası /portal'a yönlenir.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { signUpPublic, firebaseReady } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !accepted) return;

    const data = new FormData(event.currentTarget);
    const displayName = String(data.get("displayName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!firebaseReady) {
      setError(
        "Kayıt sistemi şu anda yapılandırılmamış. Lütfen daha sonra tekrar deneyin.",
      );
      return;
    }
    if (displayName.length < 3) {
      setError("Lütfen ad soyadınızı girin.");
      return;
    }
    if (!email.includes("@")) {
      setError("Geçerli bir e-posta adresi girin.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signUpPublic(email, password, displayName);
      router.push("/portal");
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="mesh-bg relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-navy/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="mb-6 flex items-center gap-3">
          <LogoMark size={44} />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-content">
              {productName}
            </h1>
            <p className="text-xs text-muted">{productFullName}</p>
          </div>
        </Link>

        <GlassCard tone="navy" className="sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Award size={14} aria-hidden="true" />
            Aday Veli / Genel Kayıt
          </span>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-content sm:text-2xl">
            Hesap Oluşturun
          </h2>
          <p className="mt-1 text-sm text-muted">
            Bursluluk başvurusu yapın ve okul bilgilerine erişin.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <TextField
              label="Ad Soyad"
              name="displayName"
              icon={User}
              placeholder="Ad Soyad"
              autoComplete="name"
              required
            />
            <TextField
              label="E-posta"
              name="email"
              type="email"
              icon={Mail}
              placeholder="ornek@eposta.com"
              autoComplete="email"
              required
            />
            <TextField
              label="Şifre"
              name="password"
              type="password"
              icon={Lock}
              placeholder="En az 6 karakter"
              autoComplete="new-password"
              required
            />

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                required
                className="mt-0.5 h-4 w-4 rounded border-overlay/20 bg-overlay/[0.04] accent-accent"
              />
              <span>KVKK metnini okudum ve kabul ediyorum.</span>
            </label>

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
              disabled={submitting || !accepted}
            >
              {submitting ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent transition-colors hover:text-content"
            >
              Giriş yapın
            </Link>
          </p>
        </GlassCard>
      </motion.section>
    </div>
  );
}
