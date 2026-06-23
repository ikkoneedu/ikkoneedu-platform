"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Ban } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ForcePasswordChange } from "@/components/auth/ForcePasswordChange";
import { getRequiredRoles, isPublicRoute } from "@/lib/auth/route-config";
import { getHomeRouteForRole } from "@/lib/auth/role-routing";

/**
 * Rol bazlı route koruması (client-side).
 *
 * Korumalı panel segmentlerine `layout.tsx` ile uygulanır:
 * - Firebase env yoksa (Mock Mod) içerik doğrudan render edilir (mevcut akış korunur).
 * - Oturum yoksa /login'e yönlendirir.
 * - Profil yoksa yetki uyarısı gösterir.
 * - Rol bu route için yetkili değilse 403 ekranı gösterir (kendi paneline link).
 */
export function RoleGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading, firebaseReady, signOut, tenantSuspended } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Halka açık yol (ör. /scholarship-exam/apply): korumalı bir segmentin altında
  // olsa bile koruma UYGULANMAZ. Böylece bursluluk başvuru/sonuç sayfaları
  // /scholarship-exam layout'u altında kalsa da herkese açık kalır.
  const publicRoute = isPublicRoute(pathname);

  const required = getRequiredRoles(pathname);
  const roleAllowed =
    required.length === 0 || (profile != null && required.includes(profile.role));

  useEffect(() => {
    if (!firebaseReady || loading || publicRoute) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [firebaseReady, loading, user, pathname, router, publicRoute]);

  // Halka açık yol: doğrudan render et (oturum gerektirmez).
  if (publicRoute) return <>{children}</>;

  // Mock Mod: koruma uygulanmaz (mevcut demo akışı korunur).
  if (!firebaseReady) return <>{children}</>;

  if (loading) {
    return (
      <div className="mesh-bg flex min-h-screen w-full items-center justify-center">
        <span className="h-1.5 w-24 animate-pulse rounded-full bg-accent/60" />
        <span className="sr-only">Yükleniyor…</span>
      </div>
    );
  }

  if (!user) return null; // /login'e yönlendiriliyor

  // Profil yoksa: oturumu kapat (yarım oturumla korumalı panelde takılı kalmasın).
  if (!profile) {
    return (
      <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
          <ShieldAlert size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-content sm:text-3xl">
          Yetki profiliniz bulunamadı
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Hesabınız var ancak yetki profiliniz tanımlı değil. Güvenliğiniz için
          oturumunuz kapatılacak. Lütfen sistem yöneticisiyle iletişime geçin.
        </p>
        <PrimaryButton
          size="lg"
          className="mt-8"
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
        >
          Çıkış Yap
          <ArrowRight size={18} aria-hidden="true" />
        </PrimaryButton>
      </main>
    );
  }

  // Askıya alınmış hesap VEYA askıya alınmış okul: korumalı panele erişemez.
  if (profile.status === "SUSPENDED" || tenantSuspended) {
    const schoolLevel = tenantSuspended && profile.status !== "SUSPENDED";
    return (
      <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand">
          <Ban size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-content sm:text-3xl">
          {schoolLevel ? "Okulunuz askıya alındı" : "Hesabınız askıya alındı"}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {schoolLevel
            ? "Bağlı olduğunuz okulun platform erişimi geçici olarak durduruldu. Lütfen okul yöneticinizle veya sistem yöneticisiyle iletişime geçin."
            : "Bu hesabın erişimi yönetici tarafından geçici olarak durduruldu. Daha fazla bilgi için okul yöneticinizle veya sistem yöneticisiyle iletişime geçin."}
        </p>
        <PrimaryButton
          size="lg"
          className="mt-8"
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
        >
          Çıkış Yap
          <ArrowRight size={18} aria-hidden="true" />
        </PrimaryButton>
      </main>
    );
  }

  // Geçici şifreyle açılan hesap: önce yeni şifre belirlemeli (ilk giriş).
  if (profile.mustChangePassword) {
    return <ForcePasswordChange />;
  }

  if (!roleAllowed) {
    return (
      <GuardNotice
        title="Bu sayfaya erişim yetkiniz yok"
        message="Bu panel rolünüz için kapalıdır. Kendi panelinize dönebilirsiniz."
        homeRoute={getHomeRouteForRole(profile.role)}
        homeLabel="Panelime dön"
      />
    );
  }

  return <>{children}</>;
}

function GuardNotice({
  title,
  message,
  homeRoute,
  homeLabel,
}: {
  title: string;
  message: string;
  homeRoute: string;
  homeLabel: string;
}) {
  return (
    <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
        <ShieldAlert size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-content sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{message}</p>
      <Link href={homeRoute} className="mt-8">
        <PrimaryButton size="lg">
          {homeLabel}
          <ArrowRight size={18} aria-hidden="true" />
        </PrimaryButton>
      </Link>
    </main>
  );
}
