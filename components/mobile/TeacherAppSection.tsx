"use client";

import { AppSectionLayout } from "@/components/mobile/AppSectionLayout";
import { useT } from "@/components/i18n/LocaleProvider";
import { teacherAppFeatures, mobileScreens } from "@/lib/mobile-mock-data";

/**
 * Öğretmen Uygulaması bölümü.
 */
export function TeacherAppSection() {
  const t = useT();
  const base = mobileScreens.find((s) => s.id === "ogretmen") ?? mobileScreens[0];
  const screen = {
    ...base,
    role: t(`mobileApp.screen.${base.id}.role`),
    title: t(`mobileApp.screen.${base.id}.title`),
    description: t(`mobileApp.screen.${base.id}.description`),
    rows: base.rows.map((_, i) => t(`mobileApp.screen.${base.id}.row.${i}`)),
  };
  const features = teacherAppFeatures.map((f) => ({
    ...f,
    title: t(`mobileApp.feature.teacher.${f.id}`),
  }));
  return (
    <AppSectionLayout
      eyebrow={t("mobileApp.teacher.eyebrow")}
      title={t("mobileApp.teacher.title")}
      description={t("mobileApp.teacher.description")}
      features={features}
      screen={screen}
    />
  );
}
