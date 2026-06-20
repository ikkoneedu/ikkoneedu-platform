"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { KeyRound, ArrowRight, AlertCircle, GraduationCap, Users } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { signInWithCode } from "@/lib/services/access-codes";
import { getUserProfile } from "@/lib/services/user-profile";
import { getHomeRouteForRole } from "@/lib/auth/role-routing";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { productName, productFullName } from "@/lib/constants";

/**
 * Öğrenci / veli kod ile giriş ekranı.
 * Öğretmenin verdiği kod (OGR-XXXXXX / VEL-XXXXXX) ile gerçek oturum açılır.
 */
export default function CodeLoginPage() {
  const router = useRouter();
  const { firebaseReady } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const code = String(data.get("code") ?? "").trim();

    if (!firebaseReady) {
      setError("Giriş sistemi şu anda yapılandırılmamış. Lütfen daha sonra deneyin.");
      return;
    }
    if (!code) {
      setError("Lütfen size verilen kodu girin.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signInWithCode(code);
      // signInWithCode sonrası kod → uid; profili oku ve role göre yönlendir.
      const { auth } = await import("@/lib/firebase/client");
      const uid = auth?.currentUser?.uid;
      const profile = uid ? await getUserProfile(uid) : null;
      if (!profile) {
        setError("Bu koda ait profil bulunamadı. Öğretmeninizle iletişime geçin.");
        setSubmitting(false);
        return;
      }
      router.push(getHomeRouteForRole(profile.role));
    } catch (err) {
      const code2 = (err as { code?: string })?.code;
      setError(
        code2 === "auth/invalid-credential" || code2 === "auth/user-not-found"
          ? "Kod geçersiz. Lütfen öğretmeninizden aldığınız kodu kontrol edin."
          : getAuthErrorMessage(err),
      );
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
            <KeyRound size={14} aria-hidden="true" />
            Öğrenci / Veli Girişi
          </span>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-content sm:text-2xl">
            Kod ile Giriş
          </h2>
          <p className="mt-1 text-sm text-muted">
            Öğretmeninizin verdiği kod ile giriş yapın.
          </p>

          <div className="mt-5 flex gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <GraduationCap size={14} className="text-accent" aria-hidden="true" />
              Öğrenci: OGR-XXXXXX
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-accent" aria-hidden="true" />
              Veli: VEL-XXXXXX
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <TextField
              label="Giriş Kodu"
              name="code"
              icon={KeyRound}
              placeholder="OGR-XXXXXX"
              autoComplete="off"
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
              disabled={submitting}
            >
              {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Yönetici / öğretmen misiniz?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent transition-colors hover:text-content"
            >
              E-posta ile giriş
            </Link>
          </p>
        </GlassCard>
      </motion.section>
    </div>
  );
}
