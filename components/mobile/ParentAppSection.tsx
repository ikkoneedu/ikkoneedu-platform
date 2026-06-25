"use client";

import { AppSectionLayout } from "@/components/mobile/AppSectionLayout";
import { useT } from "@/components/i18n/LocaleProvider";
import { parentAppFeatures, mobileScreens } from "@/lib/mobile-mock-data";

/**
 * Veli Uygulaması bölümü.
 */
export function ParentAppSection() {
  const t = useT();
  const base = mobileScreens.find((s) => s.id === "veli") ?? mobileScreens[0];
  const screen = {
    ...base,
    role: t(`mobileApp.screen.${base.id}.role`),
    title: t(`mobileApp.screen.${base.id}.title`),
    description: t(`mobileApp.screen.${base.id}.description`),
    rows: base.rows.map((_, i) => t(`mobileApp.screen.${base.id}.row.${i}`)),
  };
  const features = parentAppFeatures.map((f) => ({
    ...f,
    title: t(`mobileApp.feature.parent.${f.id}`),
  }));
  return (
    <AppSectionLayout
      eyebrow={t("mobileApp.parent.eyebrow")}
      title={t("mobileApp.parent.title")}
      description={t("mobileApp.parent.description")}
      features={features}
      screen={screen}
    />
  );
}
