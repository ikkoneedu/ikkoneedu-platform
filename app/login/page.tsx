"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  School,
  Users,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { SchoolLogo } from "@/components/school/SchoolLogo";
import { getSchool, type SchoolRecord } from "@/lib/services/schools";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { getUserProfile } from "@/lib/services/user-profile";
import { getHomeRouteForRole } from "@/lib/auth/role-routing";
import { canRoleAccess } from "@/lib/auth/route-config";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { sendPasswordReset } from "@/lib/services/auth-actions";
import { productName, productFullName, tagline } from "@/lib/constants";

const benefits = [
  { id: "okul", icon: School, textKey: "login.benefit1" },
  { id: "ai", icon: Sparkles, textKey: "login.benefit2" },
  { id: "deneyim", icon: Users, textKey: "login.benefit3" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Redirect parametresini güvenli hale getirir: yalnızca site içi mutlak yollara
 * izin verir ("/..."), protokol-bağıl ("//...") ve dış URL'leri (http..) reddeder.
 * Açık yönlendirme (open redirect) açığını kapatır.
 */
function sanitizeRedirect(raw: string): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null; // yalnızca site içi yollar
  if (raw.startsWith("//")) return null; // protokol-bağıl dış URL'yi engelle
  if (raw.startsWith("/\\")) return null; // ters eğik çizgi ile kaçış denemesi
  return raw;
}

/** role parametresine göre alt başlık anahtarı ve giriş hedefi. */
const ROLE_CONFIG: Record<string, { subtitleKey: string; target: string }> = {
  admin: { subtitleKey: "login.subtitleAdmin", target: "/admin" },
  teacher: { subtitleKey: "login.subtitleTeacher", target: "/teacher" },
  parent: { subtitleKey: "login.subtitleParent", target: "/parent" },
  student: { subtitleKey: "login.subtitleStudent", target: "/student" },
};

/** Mock demo giriş butonları. */
const DEMO_BUTTONS = [
  { id: "super", labelKey: "login.demoSuper", href: "/super-admin", icon: ShieldCheck },
  { id: "admin", labelKey: "login.demoAdmin", href: "/admin", icon: School },
  { id: "teacher", labelKey: "login.demoTeacher", href: "/teacher", icon: BookOpen },
  { id: "parent", labelKey: "login.demoParent", href: "/parent", icon: Users },
  { id: "student", labelKey: "login.demoStudent", href: "/student", icon: GraduationCap },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? "";
  const school = searchParams.get("school") ?? "";
  const redirectParam = searchParams.get("redirect") ?? "";

  const { signIn, signOut, firebaseReady } = useAuth();
  const t = useT();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [schoolBrand, setSchoolBrand] = useState<SchoolRecord | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Okuldan gelindiyse (?school=slug) o okulun marka kimliğini yükle (logo/renk).
  useEffect(() => {
    if (!school) {
      setSchoolBrand(null);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const s = await getSchool(school);
        if (active) setSchoolBrand(s);
      } catch {
        if (active) setSchoolBrand(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [school]);

  // Şifremi unuttum — girilen e-postaya Firebase sıfırlama bağlantısı gönderir.
  const handleForgotPassword = async () => {
    setResetMsg(null);
    const email = (formRef.current?.elements.namedItem("identifier") as HTMLInputElement | null)?.value?.trim() ?? "";
    if (!email || !email.includes("@")) {
      setError(t("login.errForgotEmail"));
      return;
    }
    setError(null);
    const result = await sendPasswordReset(email);
    if (result.ok) {
      setResetMsg(t("login.msgResetSent"));
    } else {
      setError(result.error ?? t("login.errResetFailed"));
    }
  };

  const config = ROLE_CONFIG[role];
  const subtitle = config ? t(config.subtitleKey) : t("login.subtitleDefault");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const identifier = String(data.get("identifier") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const remember = data.get("remember") === "on";

    // Firebase bağlı değilse SAHTE giriş yapma; net uyarı ver.
    // (Önceden mock modda /school-select'e yönlendiriliyordu — kafa karıştırıcıydı.)
    if (!firebaseReady) {
      setError(t("login.errFirebase"));
      return;
    }

    // Yalnızca e-posta/şifre girişi desteklenir.
    if (!identifier.includes("@")) {
      setError(t("login.errEmailOnly"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const user = await signIn(identifier, password, remember);
      // Firestore users/{uid} profilini oku (role, tenantId, schoolId).
      const profile = await getUserProfile(user.uid);

      // Profil yoksa: girişi sonlandır ve yetki mesajı göster.
      if (!profile) {
        await signOut();
        setError(t("login.errNoProfile"));
        setSubmitting(false);
        return;
      }

      // Güvenli yönlendirme: redirect parametresi yalnızca site içi VE bu rolün
      // erişebileceği bir yolsa kullanılır; aksi halde rolün ana sayfasına gidilir.
      const home = getHomeRouteForRole(profile.role);
      const safe = sanitizeRedirect(redirectParam);
      const safeRedirect =
        safe && canRoleAccess(profile.role, safe) ? safe : home;
      router.push(safeRedirect);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="mesh-bg relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-navy/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Sol taraf — marka ve faydalar */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <Link href="/" className="flex items-center gap-3">
            <LogoMark size={48} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-content">
                {productName}
              </h1>
              <p className="text-xs text-muted">{productFullName}</p>
            </div>
          </Link>

          <div className="space-y-2">
            <p className="text-lg font-medium text-accent">
              {t("login.heroLine")}
            </p>
            <p className="max-w-md text-2xl font-bold leading-snug tracking-tight text-content sm:text-3xl">
              {tagline}
            </p>
          </div>

          <ul className="mt-2 space-y-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li key={benefit.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-overlay/10 bg-navy/40 text-accent">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-muted sm:text-base">
                    {t(benefit.textKey)}
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.section>

        {/* Sağ taraf — giriş kartı */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}>
          <GlassCard tone="navy" className="sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
              {t("login.cardTitle", { product: productName })}
            </h2>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
            {school && schoolBrand ? (
              <div
                className="mt-3 flex items-center gap-2.5 rounded-xl border border-overlay/10 bg-overlay/[0.03] p-2.5"
                style={{ borderColor: `${schoolBrand.brandColor}44` }}
              >
                <SchoolLogo
                  logo={schoolBrand.logo}
                  brand={schoolBrand.brandColor}
                  size={36}
                  name={schoolBrand.name}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-content">{schoolBrand.name}</p>
                  {schoolBrand.slogan && (
                    <p
                      className="truncate text-xs font-medium italic"
                      style={{ color: schoolBrand.brandColor }}
                    >
                      “{schoolBrand.slogan}”
                    </p>
                  )}
                </div>
              </div>
            ) : school ? (
              <p className="mt-2 inline-block rounded-full border border-accent/20 bg-accent/10 px-3 py-0.5 text-xs font-medium text-accent">
                {t("login.schoolPrefix", { school })}
              </p>
            ) : null}

            <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4">
              <TextField
                label={t("login.identifierLabel")}
                name="identifier"
                icon={Mail}
                placeholder={t("login.identifierPlaceholder")}
                autoComplete="username"
                required
              />
              <TextField
                label={t("login.passwordLabel")}
                name="password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-muted">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-overlay/20 bg-overlay/[0.04] text-accent accent-accent focus:ring-accent"
                  />
                  {t("login.rememberMe")}
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-accent transition-colors hover:text-content"
                >
                  {t("login.forgotPassword")}
                </button>
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                  <AlertCircle size={16} aria-hidden="true" />
                  {error}
                </p>
              )}

              {resetMsg && (
                <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  <Mail size={16} aria-hidden="true" />
                  {resetMsg}
                </p>
              )}

              <PrimaryButton
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? t("login.submitting") : t("login.submit")}
                <ArrowRight size={18} aria-hidden="true" />
              </PrimaryButton>
            </form>

            {/* Demo giriş butonları — yalnızca Firebase BAĞLI DEĞİLKEN (demo/tanıtım).
                Gerçek giriş aktifken gizlenir; aksi halde korumalı panellere
                yönlendirip /login'e geri atılırdı. */}
            {!firebaseReady && (
              <div className="mt-6 border-t border-overlay/10 pt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  {t("login.demoTitle")}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {DEMO_BUTTONS.map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => router.push(btn.href)}
                        className="flex items-center gap-2 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-left text-sm font-medium text-content transition-colors hover:border-accent/30 hover:bg-overlay/[0.06]"
                      >
                        <Icon size={16} className="shrink-0 text-accent" aria-hidden="true" />
                        {t(btn.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-muted">
              {t("login.codeQuestion")}{" "}
              <Link href="/code-login" className="font-semibold text-accent transition-colors hover:text-content">
                {t("login.codeLink")}
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted">
              {t("login.registerQuestion")}{" "}
              <Link href="/register" className="font-semibold text-accent transition-colors hover:text-content">
                {t("login.registerLink")}
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted">
              {t("login.demoQuestion")}{" "}
              <Link href="/demo" className="font-semibold text-accent transition-colors hover:text-content">
                {t("login.demoLink")}
              </Link>
            </p>
            <p className="mt-4 border-t border-overlay/10 pt-4 text-center text-sm text-muted">
              {t("login.browseQuestion")}{" "}
              <Link href="/" className="font-semibold text-accent transition-colors hover:text-content">
                {t("login.browseLink")}
              </Link>
            </p>
          </GlassCard>
        </motion.section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mesh-bg min-h-screen w-full" />}>
      <LoginContent />
    </Suspense>
  );
}
