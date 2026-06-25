"use client";

import { AppSectionLayout } from "@/components/mobile/AppSectionLayout";
import { useT } from "@/components/i18n/LocaleProvider";
import { studentAppFeatures, mobileScreens } from "@/lib/mobile-mock-data";

/**
 * Öğrenci Uygulaması bölümü.
 */
export function StudentAppSection() {
  const t = useT();
  const base = mobileScreens.find((s) => s.id === "ogrenci") ?? mobileScreens[0];
  const screen = {
    ...base,
    role: t(`mobileApp.screen.${base.id}.role`),
    title: t(`mobileApp.screen.${base.id}.title`),
    description: t(`mobileApp.screen.${base.id}.description`),
    rows: base.rows.map((_, i) => t(`mobileApp.screen.${base.id}.row.${i}`)),
  };
  const features = studentAppFeatures.map((f) => ({
    ...f,
    title: t(`mobileApp.feature.student.${f.id}`),
  }));
  return (
    <AppSectionLayout
      eyebrow={t("mobileApp.student.eyebrow")}
      title={t("mobileApp.student.title")}
      description={t("mobileApp.student.description")}
      features={features}
      screen={screen}
      reverse
    />
  );
}
