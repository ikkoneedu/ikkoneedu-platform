"use client";

import Link from "next/link";
import { MapPin, Award, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { RealSchoolShell } from "@/components/school/RealSchoolShell";
import { SchoolLogo } from "@/components/school/SchoolLogo";
import { SchoolInquiryForm } from "@/components/portal/SchoolInquiryForm";

/**
 * Süper adminin oluşturduğu GERÇEK okul için halka açık sayfa.
 * Statik mock okul (PUBLIC_SCHOOLS) bulunamadığında /school/[slug] kullanır.
 */
export function RealSchoolPublic({ slug }: { slug: string }) {
  return (
    <RealSchoolShell slug={slug}>
      {(school) => (
        <>
          {/* Hero — okula özgü logo/slogan/renk */}
          <section className="flex flex-col items-center gap-5 py-8 text-center">
            <SchoolLogo
              logo={school.logo}
              brand={school.brandColor}
              size={72}
              name={school.name}
              rounded="rounded-2xl"
            />
            <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">
              {school.name}
            </h1>
            {school.slogan && (
              <p
                className="text-base font-medium italic"
                style={{ color: school.brandColor }}
              >
                “{school.slogan}”
              </p>
            )}
            {school.city && (
              <p className="flex items-center gap-1.5 text-sm text-accent">
                <MapPin size={15} aria-hidden="true" />
                {school.city}
              </p>
            )}
            <p className="max-w-2xl text-base leading-relaxed text-muted">
              {school.about
                ? school.about
                : `${school.name} hakkında bilgi almak, kayıt ve tanıtım süreçleri için aşağıdaki formu doldurun; ekibimiz en kısa sürede sizinle iletişime geçecek.`}
            </p>
          </section>

          <section className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-2">
            {/* Bursluluk CTA */}
            <GlassCard tone="navy" className="ai-gradient flex flex-col border-accent/20">
              <div className="flex items-center gap-2 text-accent">
                <Award size={20} aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Bursluluk Sınavı
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-content">
                {school.name} Bursluluk Başvurusu
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Çocuğunuz için bursluluk ve kabul sınavı başvurusunu hemen tamamlayın.
              </p>
              <Link href={`/school/${school.slug}/scholarship/apply`} className="mt-auto pt-5">
                <PrimaryButton size="lg" className="w-full sm:w-fit">
                  Bursluluk Başvurusu
                  <ArrowRight size={18} aria-hidden="true" />
                </PrimaryButton>
              </Link>
            </GlassCard>

            {/* Bilgi talebi */}
            <GlassCard tone="navy" className="flex flex-col">
              <h2 className="mb-4 text-lg font-semibold text-content">
                İletişim / Bilgi Talebi
              </h2>
              <SchoolInquiryForm schoolName={school.name} tenantId={school.id} />
            </GlassCard>
          </section>
        </>
      )}
    </RealSchoolShell>
  );
}
