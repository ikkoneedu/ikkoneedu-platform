"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import type { User } from "firebase/auth";
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
import { OtpStep } from "@/components/auth/OtpStep";
import { PhoneLoginForm } from "@/components/auth/PhoneLoginForm";
import { AuthAmbientScene } from "@/components/auth/AuthAmbientScene";
import { DragonAIBot } from "@/components/ai/DragonAIBot";
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

  const { user, profile, signIn, signOut, firebaseReady, otpVerified, markOtpVerified } = useAuth();
  const t = useT();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [schoolBrand, setSchoolBrand] = useState<SchoolRecord | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Giriş yöntemi: e-posta (+ OTP) veya telefon (SMS). Telefon SMS kodu 2.
  // faktör kabul edildiğinden telefonla girişte e-posta OTP adımı yoktur.
  const [method, setMethod] = useState<"email" | "phone">("email");
  // İki adımlı giriş: şifre doğrulandıktan sonra e-postaya kod gönderilir.
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string>("/");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "cooldown">("idle");
  const otpStepParam = searchParams.get("step") === "otp";

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

  // Şifre doğrulandıktan sonra e-postaya kod gönderir ve OTP adımına geçer.
  // Kod gönderimi başarısız olsa bile OTP ekranında kalınır (kullanıcı
  // "Tekrar gönder"i deneyebilir) — yarım oturumda protected sayfaya
  // sızma yoktur çünkü RoleGuard zaten `otpVerified`i ayrıca kontrol eder.
  const beginOtpStep = async (targetUser: User, redirectTo: string) => {
    setPendingUser(targetUser);
    setPendingRedirect(redirectTo);
    setStep("otp");
    setOtpError(null);
    try {
      const idToken = await targetUser.getIdToken();
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        setOtpError(result.error ?? t("login.otpSendFailed"));
      } else if (result.devCode) {
        setOtpError(`${t("login.otpMock")} Kod: ${result.devCode}`);
      }
    } catch {
      setOtpError(t("login.otpSendFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (code: string) => {
    if (!pendingUser || otpSubmitting) return;
    setOtpSubmitting(true);
    setOtpError(null);
    try {
      const idToken = await pendingUser.getIdToken();
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, code }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        setOtpError(result.error ?? t("login.otpSendFailed"));
        setOtpSubmitting(false);
        return;
      }
      markOtpVerified();
      router.push(pendingRedirect);
    } catch {
      setOtpError(t("login.otpSendFailed"));
      setOtpSubmitting(false);
    }
  };

  const handleOtpResend = async () => {
    if (!pendingUser || resendState === "sending" || resendState === "cooldown") return;
    setResendState("sending");
    setOtpError(null);
    try {
      const idToken = await pendingUser.getIdToken();
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        setOtpError(result.error ?? t("login.otpSendFailed"));
        setResendState(res.status === 429 ? "cooldown" : "idle");
        if (res.status === 429) setTimeout(() => setResendState("idle"), 60000);
        return;
      }
      if (result.devCode) setOtpError(`${t("login.otpMock")} Kod: ${result.devCode}`);
      setResendState("sent");
      setTimeout(() => setResendState("idle"), 60000);
    } catch {
      setOtpError(t("login.otpSendFailed"));
      setResendState("idle");
    }
  };

  const handleOtpBack = async () => {
    await signOut();
    setStep("credentials");
    setPendingUser(null);
    setOtpError(null);
  };

  // RoleGuard, OTP tamamlanmamış oturumu buraya `?step=otp` ile yönlendirir —
  // kullanıcı zaten şifreyle girmiş (Firebase oturumu açık), tekrar şifre
  // sormadan doğrudan kod adımına geç.
  useEffect(() => {
    if (!otpStepParam || !firebaseReady || !user || !profile || otpVerified) return;
    if (step === "otp") return;
    const home = getHomeRouteForRole(profile.role);
    const safe = sanitizeRedirect(redirectParam);
    const safeRedirect = safe && canRoleAccess(profile.role, safe) ? safe : home;
    void beginOtpStep(user, safeRedirect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpStepParam, firebaseReady, user, profile, otpVerified]);

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
      const signedInUser = await signIn(identifier, password, remember);
      // Firestore users/{uid} profilini oku (role, tenantId, schoolId).
      const signedInProfile = await getUserProfile(signedInUser.uid);

      // Profil yoksa: girişi sonlandır ve yetki mesajı göster.
      if (!signedInProfile) {
        await signOut();
        setError(t("login.errNoProfile"));
        setSubmitting(false);
        return;
      }

      // Güvenli yönlendirme: redirect parametresi yalnızca site içi VE bu rolün
      // erişebileceği bir yolsa kullanılır; aksi halde rolün ana sayfasına gidilir.
      const home = getHomeRouteForRole(signedInProfile.role);
      const safe = sanitizeRedirect(redirectParam);
      const safeRedirect =
        safe && canRoleAccess(signedInProfile.role, safe) ? safe : home;
      // Şifre doğru — ikinci faktör (e-posta kodu) için OTP adımına geç.
      await beginOtpStep(signedInUser, safeRedirect);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  };

  // Telefonla (SMS) giriş başarılı — profil oku, yetki kontrolü + yönlendir.
  // SMS kodu 2. faktör olduğundan e-posta OTP adımı UYGULANMAZ.
  const handlePhoneAuthenticated = async (signedInUser: User) => {
    const signedInProfile = await getUserProfile(signedInUser.uid);
    if (!signedInProfile) {
      // Numara hiçbir hesaba bağlı değil (Firebase boş telefon hesabı açtı) —
      // oturumu kapat ve yönlendir.
      await signOut();
      setError(t("login.phoneNoAccount"));
      return;
    }
    const home = getHomeRouteForRole(signedInProfile.role);
    const safe = sanitizeRedirect(redirectParam);
    const safeRedirect =
      safe && canRoleAccess(signedInProfile.role, safe) ? safe : home;
    markOtpVerified(signedInUser.uid);
    router.push(safeRedirect);
  };

  return (
    <div className="mesh-bg relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* 3B-hisli hareketli arka plan (ana sayfa sinematik havasının devamı) */}
      <AuthAmbientScene />
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-navy/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
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

          {/* 3B-hisli hareketli maskot — giriş sahnesine premium bir karşılama.
              Sahnede süzülür/sallanır (bkz. DragonAIBot). Küçük ekranda gizli
              (kartın üstünü sıkıştırmasın); sm ve üzerinde belirir. */}
          <div className="relative mt-4 hidden h-52 items-end justify-center sm:flex">
            <div className="absolute bottom-8 h-6 w-44 rounded-[50%] bg-accent/25 blur-2xl" />
            <DragonAIBot
              inline
              size={188}
              greeting="Hoş geldiniz! Giriş yapmaya hazır mısınız?"
              label={`${productName} AI Asistanı`}
            />
          </div>
        </motion.section>

        {/* Sağ taraf — giriş kartı */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}>
          <GlassCard tone="navy" className="sm:p-8">
            {step === "otp" ? (
              <OtpStep
                email={profile?.email ?? pendingUser?.email ?? ""}
                submitting={otpSubmitting}
                error={otpError}
                resendState={resendState}
                onSubmit={(code) => void handleOtpSubmit(code)}
                onResend={() => void handleOtpResend()}
                onBack={() => void handleOtpBack()}
              />
            ) : (
              <>
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

            {/* Giriş yöntemi sekmeleri: E-posta (+ kod) / Telefon (SMS) */}
            <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-overlay/10 bg-overlay/[0.03] p-1">
              {(["email", "phone"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMethod(m);
                    setError(null);
                    setResetMsg(null);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    method === m
                      ? "bg-accent/15 text-accent"
                      : "text-muted hover:text-content"
                  }`}
                  aria-pressed={method === m}
                >
                  {m === "email" ? t("login.tabEmail") : t("login.tabPhone")}
                </button>
              ))}
            </div>

            {method === "phone" ? (
              <div className="mt-6">
                <PhoneLoginForm
                  onAuthenticated={(u) => handlePhoneAuthenticated(u)}
                  disabled={!firebaseReady}
                />
                {!firebaseReady && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                    <AlertCircle size={16} aria-hidden="true" />
                    {t("login.errFirebase")}
                  </p>
                )}
              </div>
            ) : (
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
            )}

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
              </>
            )}
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
