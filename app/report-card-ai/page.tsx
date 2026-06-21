import type { Metadata } from "next";
import { AiComingSoonNotice } from "@/components/ai/AiComingSoonNotice";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StudentSelector } from "@/components/report-card/StudentSelector";
import { PerformanceForm } from "@/components/report-card/PerformanceForm";
import { ToneSelector } from "@/components/report-card/ToneSelector";
import { GeneratedComment } from "@/components/report-card/GeneratedComment";
import { ReportCardPreview } from "@/components/report-card/ReportCardPreview";
import { productName } from "@/lib/constants";
import { tones, generatedComment } from "@/lib/report-card-mock-data";

export const metadata: Metadata = {
  title: `AI Karne Asistanı — ${productName}`,
  description:
    "Öğrenci performansına göre kişiselleştirilmiş, pedagojik ve kurumsal karne yorumları oluşturun.",
};

export default function ReportCardAiPage() {
  return (
    <PageShell title="AI Karne Asistanı">
      <div className="flex flex-col gap-10">
        <AiComingSoonNotice />

        <SectionHeader
          eyebrow="Yapay Zeka"
          title="AI Karne Asistanı"
          description="Öğrenci performansına göre kişiselleştirilmiş, pedagojik ve kurumsal karne yorumları oluşturun."
        />

        {/* 1 + 2. Öğrenci seçimi ve performans formu */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StudentSelector />
          <PerformanceForm />
        </div>

        {/* 3. Ton seçimi */}
        <ToneSelector tones={tones} />

        {/* 4 + 5. Oluşturulan yorum ve karne önizleme */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GeneratedComment defaultComment={generatedComment} />
          <ReportCardPreview />
        </div>
      </div>
    </PageShell>
  );
}
