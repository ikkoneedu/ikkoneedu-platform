"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, User, Phone, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRequireAuth } from "@/components/auth/useRequireAuth";
import { updateMyProfile } from "@/lib/services/user-profile";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { ROLE_LABELS } from "@/lib/auth/role-constants";
import { getHomeRouteForRole } from "@/lib/auth/role-routing";
import { productName } from "@/lib/constants";

/** Profil düzenleme — kullanıcı kendi ad/telefonunu günceller. */
export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { loading } = useRequireAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || busy) return;
    const data = new FormData(event.currentTarget);
    const displayName = String(data.get("displayName") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (displayName.length < 2) {
      setError("Lütfen geçerli bir ad girin.");
      return;
    }
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      await updateMyProfile(user.uid, { displayName, phone });
      await refreshProfile();
      setDone(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="mesh-bg flex min-h-screen w-full items-center justify-center">
        <span className="h-1.5 w-24 animate-pulse rounded-full bg-accent/60" />
        <span className="sr-only">Yükleniyor…</span>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen w-full px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight text-content">
              {productName}
            </span>
          </Link>
          <Link
            href={getHomeRouteForRole(profile.role)}
            className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-content"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Panele dön
          </Link>
        </div>

        <GlassCard tone="navy" className="sm:p-8">
          <h1 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
            Profilim
          </h1>
          <p className="mt-1 text-sm text-muted">
            {profile.email} · {ROLE_LABELS[profile.role] ?? profile.role}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <TextField
              label="Ad Soyad"
              name="displayName"
              icon={User}
              defaultValue={profile.displayName}
              required
            />
            <TextField
              label="Telefon"
              name="phone"
              type="tel"
              icon={Phone}
              defaultValue={profile.phone ?? ""}
              placeholder="0 5xx xxx xx xx"
            />

            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                <AlertCircle size={16} aria-hidden="true" />
                {error}
              </p>
            )}
            {done && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} aria-hidden="true" />
                Profiliniz güncellendi.
              </p>
            )}

            <PrimaryButton type="submit" size="lg" className="w-full" disabled={busy}>
              <Save size={18} aria-hidden="true" />
              {busy ? "Kaydediliyor…" : "Kaydet"}
            </PrimaryButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
