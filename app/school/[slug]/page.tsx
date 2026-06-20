import type { Metadata } from "next";
import Link from "next/link";
import { Award, IdCard, FileSearch, Megaphone, ArrowRight, MapPin, CalendarCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LogoMark } from "@/components/shared/LogoMark";
import { SchoolPublicShell } from "@/components/school/SchoolPublicShell";
import { RealSchoolPublic } from "@/components/school/RealSchoolPublic";
import { PUBLIC_SCHOOLS, getPublicSchoolBySlug } from "@/lib/tenant/tenant-config";
import { productName } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PUBLIC_SCHOOLS.map((school) => ({ slug: school.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const school = getPublicSchoolBySlug(slug);
  return {
    title: school ? `${school.schoolName} — ${productName}` : `Okul — ${productName}`,
    description: school?.intro,
  };
}

const announcements = [
  { id: "1", title: "2027 Bursluluk ve Kabul Sınavı başvuruları açıldı.", date: "Bugün" },
  { id: "2", title: "Tanıtım günleri için randevu oluşturabilirsiniz.", date: "2 gün önce" },
  { id: "3", title: "Yeni dönem kayıt görüşmeleri başladı.", date: "1 hafta önce" },
];

export default async function SchoolPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const school = getPublicSchoolBySlug(slug);
  // Statik mock okul yoksa, süper adminin oluşturduğu gerçek okulu (tenant)
  // istemci tarafında yükle ve halka açık sayfayı göster.
  if (!school) return <RealSchoolPublic slug={slug} />;

  return (
    <SchoolPublicShell school={school}>
      {/* Hero */}
      <section className="flex flex-col items-center gap-5 py-8 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10"
          style={{ backgroundColor: `${school.brandColor}22` }}
        >
          <LogoMark size={40} />
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">
          {school.schoolName}
        </h1>
        <p className="flex items-center gap-1.5 text-sm text-accent">
          <MapPin size={15} aria-hidden="true" />
          {school.campus}
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-muted">{school.intro}</p>
      </section>

      {/* Bursluluk + Randevu CTA */}
      <section className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-2">
        <GlassCard tone="navy" className="ai-gradient flex flex-col border-accent/20">
          <div className="flex items-center gap-2 text-accent">
            <Award size={20} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Bursluluk Sınavı
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-content">
            {school.schoolName} Bursluluk Sınavı
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

        <GlassCard tone="navy" className="flex flex-col">
          <div className="flex items-center gap-2 text-accent">
            <CalendarCheck size={20} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Tanıtım & Kayıt
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-content">
            Randevu / Demo Talep Edin
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Okulumuzu yakından tanımak için tanıtım randevusu oluşturun.
          </p>
          <Link href="/demo" className="mt-auto pt-5">
            <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-fit">
              Randevu / Demo Talep Et
            </PrimaryButton>
          </Link>
        </GlassCard>
      </section>

      {/* Duyurular */}
      <section className="py-6">
        <div className="mb-4 flex items-center gap-2 text-content">
          <Megaphone size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Duyurular</h2>
        </div>
        <GlassCard tone="navy">
          <ul className="divide-y divide-white/5">
            {announcements.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-content">{item.title}</span>
                <span className="shrink-0 text-xs text-muted">{item.date}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      {/* Bursluluk hizmet bağlantıları */}
      <section className="py-6">
        <SectionHeader align="center" eyebrow="Bursluluk Sınavı" title="Hızlı Erişim" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { id: "apply", label: "Bursluluk Başvurusu", href: `/school/${school.slug}/scholarship/apply`, icon: Award },
            { id: "card", label: "Sınav Giriş Belgesi", href: `/school/${school.slug}/scholarship/admission-card`, icon: IdCard },
            { id: "results", label: "Sonuç Sorgula", href: `/school/${school.slug}/scholarship/results`, icon: FileSearch },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.href}>
                <GlassCard tone="navy" interactive className="flex h-full items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-content">{item.label}</span>
                  <ArrowRight size={16} className="text-muted" aria-hidden="true" />
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </section>
    </SchoolPublicShell>
  );
}
