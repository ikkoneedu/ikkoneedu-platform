import type { Metadata } from "next";
import { AiComingSoonNotice } from "@/components/ai/AiComingSoonNotice";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ExamHero } from "@/components/exam/ExamHero";
import { ExamBuilderForm } from "@/components/exam/ExamBuilderForm";
import { GeneratedExamPreview } from "@/components/exam/GeneratedExamPreview";
import { QuestionBankOverview } from "@/components/exam/QuestionBankOverview";
import { QualityAnalysisCard } from "@/components/exam/QualityAnalysisCard";
import { WorksheetGenerator } from "@/components/exam/WorksheetGenerator";
import { QuizGenerator } from "@/components/exam/QuizGenerator";
import { ExportCenter } from "@/components/exam/ExportCenter";
import { AiExamSuggestions } from "@/components/exam/AiExamSuggestions";
import { productName } from "@/lib/constants";
import {
  examFormOptions,
  examGeneratedQuestions,
  examQuestionBankMetrics,
  examBankFilters,
  examQualityMetrics,
  examWorksheetOptions,
  examQuizOptions,
  examAiSuggestions,
} from "@/lib/exam-mock-data";

export const metadata: Metadata = {
  title: `AI Sınav Oluşturucu — ${productName}`,
  description:
    "Yapay zeka desteğiyle sınavlar, quizler ve çalışma kağıtları oluşturun.",
};

export default function ExamAiPage() {
  return (
    <PageShell title="AI Sınav Oluşturucu">
      <div className="flex flex-col gap-10">
        <AiComingSoonNotice />

        <SectionHeader
          eyebrow="Yapay Zeka"
          title="AI Sınav Oluşturucu"
          description="Yapay zeka desteğiyle sınavlar, quizler ve çalışma kağıtları oluşturun."
        />

        {/* 1. Hero */}
        <ExamHero />

        {/* 2 + 3. Form ve önizleme */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExamBuilderForm options={examFormOptions} />
          <GeneratedExamPreview questions={examGeneratedQuestions} />
        </div>

        {/* 4. Soru bankası */}
        <QuestionBankOverview
          metrics={examQuestionBankMetrics}
          filters={examBankFilters}
        />

        {/* 5. Kalite analizi */}
        <QualityAnalysisCard metrics={examQualityMetrics} />

        {/* 6 + 7. Çalışma kağıdı ve quiz üretici */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorksheetGenerator options={examWorksheetOptions} />
          <QuizGenerator options={examQuizOptions} />
        </div>

        {/* 8. Dışa aktarma */}
        <ExportCenter questions={examGeneratedQuestions} />

        {/* 9. AI önerileri */}
        <AiExamSuggestions suggestions={examAiSuggestions} />
      </div>
    </PageShell>
  );
}
