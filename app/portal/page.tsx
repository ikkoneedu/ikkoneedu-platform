"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Globe, LogOut, GraduationCap, MapPin, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRequireAuth } from "@/components/auth/useRequireAuth";
import { PUBLIC_SCHOOLS } from "@/lib/tenant/tenant-config";
import { productName } from "@/lib/constants";

/**
 * Halk (genel kullanıcı) portalı.
 * Giriş yapan PUBLIC kullanıcılar burada okulları görür, bursluluk başvurusu
 * yapar ve okulların halka açık sayfalarına erişir.
 */
export default function PortalPage() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { loading } = useRequireAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="mesh-bg flex min-h-screen w-full items-center justify-center">
        <span className="h-1.5 w-24 animate-pulse rounded-full bg-accent/60" />
        <span className="sr-only">Yükleniyor…</span>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      {/* Üst bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight text-content">
              {productName}
            </span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-content transition-colors hover:border-accent/30 hover:bg-white/[0.06]"
          >
            <LogOut size={16} className="text-accent" aria-hidden="true" />
            Çıkış
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <SectionHeader
          align="left"
          eyebrow={
            profile?.displayName
              ? `Hoş geldiniz, ${profile.displayName}`
              : "Hoş geldiniz"
          }
          title="Okul Portalı"
          description="Bursluluk başvurusu yapın, okulların tanıtım sayfalarını inceleyin ve süreçlerinizi takip edin."
          className="mb-10"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_SCHOOLS.map((school) => (
            <GlassCard key={school.slug} tone="navy" className="flex flex-col">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-content"
                style={{ backgroundColor: `${school.brandColor}22` }}
              >
                <GraduationCap size={24} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-content">
                {school.schoolName}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={14} aria-hidden="true" />
                {school.campus}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {school.intro}
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <Link href={`/school/${school.slug}/scholarship/apply`}>
                  <PrimaryButton size="sm" className="w-full">
                    <Award size={16} aria-hidden="true" />
                    Bursluluk Başvurusu
                  </PrimaryButton>
                </Link>
                <Link
                  href={`/school/${school.slug}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-content transition-colors hover:border-accent/30 hover:bg-white/[0.06]"
                >
                  <Globe size={15} className="text-accent" aria-hidden="true" />
                  Okul Sayfası
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="font-medium text-content">{productName}</span>
          </div>
          <p>© {new Date().getFullYear()} {productName}. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
