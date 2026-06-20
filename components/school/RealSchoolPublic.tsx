"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ShieldQuestion, ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SchoolInquiryForm } from "@/components/portal/SchoolInquiryForm";
import { getSchool, type SchoolRecord } from "@/lib/services/schools";
import { productName } from "@/lib/constants";

/**
 * Süper adminin oluşturduğu GERÇEK okul için halka açık sayfa.
 * Statik mock okul (PUBLIC_SCHOOLS) bulunamadığında /school/[slug] tarafından
 * kullanılır. Tenant belgesi halka açık okunur; ziyaretçi bilgi talebi gönderir.
 */
export function RealSchoolPublic({ slug }: { slug: string }) {
  const [school, setSchool] = useState<SchoolRecord | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const s = await getSchool(slug);
        if (active) setSchool(s);
      } catch {
        if (active) setSchool(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (school === undefined) {
    return (
      <div className="mesh-bg flex min-h-screen w-full items-center justify-center">
        <span className="h-1.5 w-24 animate-pulse rounded-full bg-accent/60" />
        <span className="sr-only">Yükleniyor…</span>
      </div>
    );
  }

  if (school === null || school.status === "SUSPENDED") {
    return (
      <main className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
          <ShieldQuestion size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-content sm:text-3xl">
          Okul bulunamadı
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Aradığınız okul yayında değil veya adresi değişmiş olabilir.
        </p>
        <Link href="/portal" className="mt-8">
          <PrimaryButton size="lg">
            <ArrowLeft size={18} aria-hidden="true" />
            Okul Portalına Dön
          </PrimaryButton>
        </Link>
      </main>
    );
  }

  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={`/school/${school.slug}`} className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="truncate text-sm font-semibold tracking-tight text-content sm:text-base">
              {school.name}
            </span>
          </Link>
          <Link href={`/login?school=${school.slug}`}>
            <PrimaryButton size="sm">Okul Portalına Giriş</PrimaryButton>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="flex flex-col items-center gap-5 py-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-navy/40">
            <LogoMark size={40} />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">
            {school.name}
          </h1>
          {school.city && (
            <p className="flex items-center gap-1.5 text-sm text-accent">
              <MapPin size={15} aria-hidden="true" />
              {school.city}
            </p>
          )}
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            {school.name} hakkında bilgi almak, kayıt ve tanıtım süreçleri için
            aşağıdaki formu doldurun; ekibimiz en kısa sürede sizinle iletişime
            geçecek.
          </p>
        </section>

        {/* Bilgi talebi */}
        <section className="mx-auto max-w-lg py-6">
          <GlassCard tone="navy">
            <h2 className="mb-4 text-lg font-semibold text-content">İletişim / Bilgi Talebi</h2>
            <SchoolInquiryForm schoolName={school.name} tenantId={school.id} />
          </GlassCard>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span className="font-medium text-content">{productName}</span>
          </div>
          <p>© {new Date().getFullYear()} {school.name}</p>
        </div>
      </footer>
    </div>
  );
}
