import { AppSectionLayout } from "@/components/mobile/AppSectionLayout";
import { studentAppFeatures, mobileScreens } from "@/lib/mobile-mock-data";

/**
 * Öğrenci Uygulaması bölümü.
 */
export function StudentAppSection() {
  const screen = mobileScreens.find((s) => s.id === "ogrenci") ?? mobileScreens[0];
  return (
    <AppSectionLayout
      eyebrow="Öğrenci"
      title="Öğrenci Uygulaması"
      description="Ders programı, ödevler, rozetler ve AI ders koçu ile öğrenme her yerde."
      features={studentAppFeatures}
      screen={screen}
      reverse
    />
  );
}
