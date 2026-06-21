"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  Mail,
  School,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRequireAuth } from "@/components/auth/useRequireAuth";
import { updateMyProfile } from "@/lib/services/user-profile";
import { getSchool } from "@/lib/services/schools";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { ROLES, ROLE_LABELS } from "@/lib/auth/role-constants";
import { getHomeRouteForRole } from "@/lib/auth/role-routing";
import { productName } from "@/lib/constants";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IK";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Role özel hızlı erişim bağlantısı. */
function roleQuickLink(role: string): { href: string; label: string } | null {
  switch (role) {
    case ROLES.TEACHER:
      return { href: "/teacher/classes", label: "Sınıflarım ve Kodlar" };
    case ROLES.COORDINATOR:
      return { href: "/teacher", label: "Öğretmen Paneli" };
    case ROLES.STUDENT:
      return { href: "/student", label: "Öğrenci Panelim" };
    case ROLES.PARENT:
      return { href: "/parent", label: "Veli Panelim" };
    case ROLES.SUPER_ADMIN:
      return { href: "/super-admin", label: "Süper Admin Konsolu" };
    case ROLES.FOUNDER:
    case ROLES.SCHOOL_ADMIN:
    case ROLES.PRINCIPAL:
    case ROLES.VICE_PRINCIPAL:
      return { href: "/admin", label: "Okul Yönetim Paneli" };
    default:
      return null;
  }
}

/** Profil — kullanıcı kendi bilgilerini görür ve ad/telefonunu günceller. */
export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { loading } = useRequireAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);

  // Kullanıcının okulunu (tenant) çöz — okul adını göster.
  useEffect(() => {
    const tid = profile?.tenantId;
    if (!tid || tid === "public" || tid === "platform") {
      setSchoolName(null);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const school = await getSchool(tid);
        if (active) setSchoolName(school?.name ?? null);
      } catch {
        if (active) setSchoolName(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [profile?.tenantId]);

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

  const suspended = profile.status === "SUSPENDED";
  const quick = roleQuickLink(profile.role);
  const schoolDisplay =
    schoolName ??
    (profile.tenantId === "public"
      ? "Genel Kullanıcı"
      : profile.tenantId === "platform"
        ? "Platform"
        : profile.tenantId || "—");

  const details = [
    { icon: Mail, label: "E-posta", value: profile.email },
    { icon: School, label: "Okul", value: schoolDisplay },
    { icon: ShieldCheck, label: "Rol", value: ROLE_LABELS[profile.role] ?? profile.role },
    ...(profile.className
      ? [{ icon: User, label: "Sınıf", value: profile.className }]
      : []),
  ];

  return (
    <div className="mesh-bg min-h-screen w-full px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
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

        {/* Kimlik kartı */}
        <GlassCard tone="navy" className="sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-navy text-xl font-bold text-accent">
              {initials(profile.displayName || profile.email)}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
                {profile.displayName || "Kullanıcı"}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    suspended
                      ? "border-brand/30 bg-brand/10 text-brand"
                      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                  }`}
                >
                  {suspended ? "Askıda" : "Aktif"}
                </span>
              </div>
            </div>
            {quick && (
              <Link href={quick.href} className="sm:ml-auto">
                <PrimaryButton variant="secondary" size="sm">
                  {quick.label}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </PrimaryButton>
              </Link>
            )}
          </div>

          {/* Bilgi ızgarası */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted">{d.label}</p>
                    <p className="truncate text-sm font-medium text-content">{d.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Düzenleme */}
        <GlassCard tone="navy" className="mt-6 sm:p-8">
          <h2 className="text-lg font-semibold text-content">Profili Düzenle</h2>
          <p className="mt-1 text-sm text-muted">
            Ad ve telefon bilgilerinizi güncelleyebilirsiniz. Rol, okul ve hesap
            durumu yöneticiniz tarafından belirlenir.
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
