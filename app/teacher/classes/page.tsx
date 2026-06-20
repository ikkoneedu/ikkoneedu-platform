import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ClassCodeManager } from "@/components/teacher/ClassCodeManager";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Sınıflarım ve Kodlar — ${productName}`,
  description:
    "Sınıflarınızı oluşturun, öğrenci ve veli giriş kodlarını üretin ve yönetin.",
};

export default function TeacherClassesPage() {
  return (
    <PageShell title="Sınıflarım ve Kodlar">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Öğretmen"
          title="Sınıflarım ve Erişim Kodları"
          description="Sınıf oluşturun, öğrenci ve veli için giriş kodu üretin. Kodu alan kişi 'Kod ile giriş' ekranından sisteme girer."
        />
        <ClassCodeManager />
      </div>
    </PageShell>
  );
}
