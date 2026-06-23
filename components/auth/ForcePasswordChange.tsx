"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "firebase/auth";
import { KeyRound, ArrowRight, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { setMustChangePassword } from "@/lib/services/user-profile";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/**
 * İlk giriş zorunlu şifre değiştirme ekranı.
 *
 * Geçici şifreyle açılan hesaplarda `profile.mustChangePassword === true`'dur.
 * RoleGuard bu durumda korumalı içerik yerine bu ekranı gösterir. Kullanıcı yeni
 * şifresini belirler; Firebase Auth şifresi güncellenir ve bayrak temizlenir.
 * E-posta/SMS gönderimi YOK; tamamen uygulama içi.
 */
export function ForcePasswordChange() {
  const { user, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !user) return;
    const data = new FormData(event.currentTarget);
    const next = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (next.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (next !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updatePassword(user, next);
      await setMustChangePassword(user.uid, false);
      await refreshProfile();
      // refreshProfile sonrası RoleGuard bayrağı temizlenmiş profille yeniden render eder.
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/requires-recent-login") {
        setError(
          "Güvenlik için lütfen tekrar giriş yapın, ardından şifrenizi değiştirin.",
        );
        await signOut();
        router.replace("/login");
        return;
      }
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mesh-bg flex min-h-screen w-full items-center justify-center px-4 py-10">
      <GlassCard tone="navy" className="w-full max-w-md sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <KeyRound size={14} aria-hidden="true" />
          İlk Giriş
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-content sm:text-2xl">
          Yeni Şifre Belirleyin
        </h1>
        <p className="mt-1 text-sm text-muted">
          Hesabınız geçici bir şifreyle açıldı. Devam etmek için lütfen yeni bir
          şifre belirleyin.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextField
            label="Yeni Şifre"
            name="password"
            type="password"
            placeholder="En az 8 karakter"
            autoComplete="new-password"
            required
          />
          <TextField
            label="Yeni Şifre (Tekrar)"
            name="confirm"
            type="password"
            placeholder="Şifreyi tekrar girin"
            autoComplete="new-password"
            required
          />

          {error && (
            <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
              <AlertCircle size={16} aria-hidden="true" />
              {error}
            </p>
          )}

          <PrimaryButton type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Kaydediliyor…" : "Şifreyi Güncelle"}
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </form>
      </GlassCard>
    </main>
  );
}
