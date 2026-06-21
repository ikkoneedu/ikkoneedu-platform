"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Ban } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { getRequiredRoles } from "@/lib/auth/route-config";
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
  const { user, profile, loading, firebaseReady, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const required = getRequiredRoles(pathname);
  const roleAllowed =
    required.length === 0 || (profile != null && required.includes(profile.role));

  useEffect(() => {
    if (!firebaseReady || loading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [firebaseReady, loading, user, pathname, router]);

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

  if (!profile) {
    return (
      <GuardNotice
        title="Yetki profiliniz bulunamadı"
        message="Hesabınız var ancak yetki profiliniz tanımlı değil. Lütfen sistem yöneticisiyle iletişime geçin."
        homeRoute="/login"
        homeLabel="Giriş ekranına dön"
      />
    );
  }

  // Askıya alınmış hesap: hiçbir korumalı panele erişemez.
  if (profile.status === "SUSPENDED") {
    return (
      <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand">
          <Ban size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-content sm:text-3xl">
          Hesabınız askıya alındı
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Bu hesabın erişimi yönetici tarafından geçici olarak durduruldu. Daha
          fazla bilgi için okul yöneticinizle veya sistem yöneticisiyle iletişime
          geçin.
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
