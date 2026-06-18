import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ExecutiveHero } from "@/components/executive/ExecutiveHero";
import { ExecutiveMetrics } from "@/components/executive/ExecutiveMetrics";
import { AdmissionsFunnel } from "@/components/executive/AdmissionsFunnel";
import { FinancialOverview } from "@/components/executive/FinancialOverview";
import { AcademicTrends } from "@/components/executive/AcademicTrends";
import { ParentSatisfaction } from "@/components/executive/ParentSatisfaction";
import { AiImpactAnalysis } from "@/components/executive/AiImpactAnalysis";
import { CampusComparison } from "@/components/executive/CampusComparison";
import { ExecutiveInsights } from "@/components/executive/ExecutiveInsights";
import { StrategicActions } from "@/components/executive/StrategicActions";
import { productName } from "@/lib/constants";
import {
  executiveMetrics,
  admissionsFunnel,
  admissionsBreakdown,
  financialMetrics,
  monthlyRevenueTrend,
  academicMetrics,
  academicTrend,
  parentSatisfaction,
  aiImpact,
  campusComparison,
  executiveInsights,
  strategicActions,
} from "@/lib/executive-mock-data";

export const metadata: Metadata = {
  title: `Executive Dashboard — ${productName}`,
  description:
    "Kayıt, finans, veli memnuniyeti, akademik başarı ve yapay zeka kullanımını tek ekrandan izleyin.",
};

export default function ExecutivePage() {
  return (
    <PageShell title="Executive Dashboard">
      <div className="flex flex-col gap-10">
        {/* 1. Başlık */}
        <ExecutiveHero />

        {/* 2. Yönetici özet kartları */}
        <ExecutiveMetrics metrics={executiveMetrics} />

        {/* 3. Kayıt ve aday veli analitiği */}
        <AdmissionsFunnel funnel={admissionsFunnel} breakdown={admissionsBreakdown} />

        {/* 4 + 5. Finansal ve akademik */}
        <FinancialOverview metrics={financialMetrics} trend={monthlyRevenueTrend} />
        <AcademicTrends metrics={academicMetrics} trend={academicTrend} />

        {/* 6 + 7. Veli memnuniyeti ve AI etkisi */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ParentSatisfaction metrics={parentSatisfaction} />
          <AiImpactAnalysis metrics={aiImpact} />
        </div>

        {/* 8. Kampüs karşılaştırması */}
        <CampusComparison rows={campusComparison} />

        {/* 9. AI yönetici öngörüleri */}
        <ExecutiveInsights insights={executiveInsights} />

        {/* 10. Stratejik aksiyonlar */}
        <StrategicActions actions={strategicActions} />
      </div>
    </PageShell>
  );
}
