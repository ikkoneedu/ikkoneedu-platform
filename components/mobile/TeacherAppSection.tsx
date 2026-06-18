import { AppSectionLayout } from "@/components/mobile/AppSectionLayout";
import { teacherAppFeatures, mobileScreens } from "@/lib/mobile-mock-data";

/**
 * Öğretmen Uygulaması bölümü.
 */
export function TeacherAppSection() {
  const screen = mobileScreens.find((s) => s.id === "ogretmen") ?? mobileScreens[0];
  return (
    <AppSectionLayout
      eyebrow="Öğretmen"
      title="Öğretmen Uygulaması"
      description="Yoklama, ödev yönetimi ve AI içerik üretimi sınıfın her anında yanınızda."
      features={teacherAppFeatures}
      screen={screen}
    />
  );
}
