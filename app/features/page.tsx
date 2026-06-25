import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { HeroSection } from "@/components/features/HeroSection";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { AiFeatures } from "@/components/features/AiFeatures";
import { SecuritySection } from "@/components/features/SecuritySection";
import { CallToAction } from "@/components/features/CallToAction";
import { buildMetadata } from "@/lib/seo/seo";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";
import {
  managementFeatures,
  studentFeatures,
  parentFeatures,
  teacherFeatures,
  aiFeatures,
  saasFeatures,
  securityFeatures,
  type FeatureItem,
} from "@/lib/features-data";
import type { TranslateFn } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return buildMetadata({
    title: t("features.meta.title"),
    path: "/features",
    description: t("features.meta.description"),
    keywords: ["eğitim kurumu yazılımı", "okul otomasyon sistemi", "veli iletişim uygulaması"],
  });
}

/**
 * Modül-seviyesi TR özellik dizilerini, çeviri anahtarları üzerinden
 * yerelleştirilmiş başlık/açıklamalara dönüştürür. Anahtar deseni:
 * `features.<namespace>.<id>.title` / `.description`.
 */
function localizeFeatures(
  t: TranslateFn,
  namespace: string,
  items: FeatureItem[],
): FeatureItem[] {
  return items.map((item) => ({
    ...item,
    title: t(`features.${namespace}.${item.id}.title`),
    description: t(`features.${namespace}.${item.id}.description`),
  }));
}

export default async function FeaturesPage() {
  const t = await getServerT();

  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      {/* Üst bar */}
      <header className="sticky top-0 z-30 border-b border-overlay/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight text-content">
              {productName}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <PrimaryButton variant="ghost" size="sm">
                {t("features.nav.login")}
              </PrimaryButton>
            </Link>
            <Link href="/demo">
              <PrimaryButton size="sm">{t("features.nav.requestDemo")}</PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Yönetim modülleri */}
        <FeatureGrid
          eyebrow={t("features.section.management.eyebrow")}
          title={t("features.section.management.title")}
          items={localizeFeatures(t, "management", managementFeatures)}
        />

        {/* 3. Öğrenci deneyimi */}
        <FeatureGrid
          eyebrow={t("features.section.student.eyebrow")}
          title={t("features.section.student.title")}
          items={localizeFeatures(t, "student", studentFeatures)}
        />

        {/* 4. Veli deneyimi */}
        <FeatureGrid
          eyebrow={t("features.section.parent.eyebrow")}
          title={t("features.section.parent.title")}
          items={localizeFeatures(t, "parent", parentFeatures)}
        />

        {/* 5. Öğretmen deneyimi */}
        <FeatureGrid
          eyebrow={t("features.section.teacher.eyebrow")}
          title={t("features.section.teacher.title")}
          items={localizeFeatures(t, "teacher", teacherFeatures)}
        />

        {/* 6. Yapay zeka modülleri */}
        <AiFeatures items={localizeFeatures(t, "ai", aiFeatures)} />

        {/* 7. SaaS özellikleri */}
        <FeatureGrid
          eyebrow={t("features.section.saas.eyebrow")}
          title={t("features.section.saas.title")}
          items={localizeFeatures(t, "saas", saasFeatures)}
        />

        {/* 8. Güvenlik */}
        <SecuritySection items={localizeFeatures(t, "security", securityFeatures)} />

        {/* 9. Son CTA */}
        <CallToAction />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
