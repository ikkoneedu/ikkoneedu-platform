import { AppSectionLayout } from "@/components/mobile/AppSectionLayout";
import { parentAppFeatures, mobileScreens } from "@/lib/mobile-mock-data";

/**
 * Veli Uygulaması bölümü.
 */
export function ParentAppSection() {
  const screen = mobileScreens.find((s) => s.id === "veli") ?? mobileScreens[0];
  return (
    <AppSectionLayout
      eyebrow="Veli"
      title="Veli Uygulaması"
      description="Çocuğunuzun okul yaşamını, duyuruları ve iletişimi her an avucunuzda taşıyın."
      features={parentAppFeatures}
      screen={screen}
    />
  );
}
