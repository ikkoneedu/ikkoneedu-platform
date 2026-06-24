import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LessonPlansBoard } from "@/components/lesson-plans/LessonPlansBoard";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Ders Planları — ${productName}`,
  description: "Öğretmen ders planları: sınıf bazlı paylaşım.",
};

export default function LessonPlansPage() {
  return (
    <PageShell title="Ders Planları">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Akademik"
          title="Ders Planları"
          description="Öğretmenler ders planlarını sınıf bazlı paylaşır; öğrenci ve veliler kendi sınıflarının planlarını görür."
        />
        <LessonPlansBoard />
      </div>
    </PageShell>
  );
}
