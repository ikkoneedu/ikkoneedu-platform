import type { Metadata } from "next";
import Link from "next/link";
import { Contact, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { crmMetrics } from "@/lib/crm-mock-data";
import { ExecutiveHero } from "@/components/executive/ExecutiveHero";
import { ExecutiveMetrics } from "@/components/executive/ExecutiveMetrics";
import { LiveExecutiveMetrics } from "@/components/executive/LiveExecutiveMetrics";
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

        {/* Canlı okul metrikleri (gerçek toplama) */}
        <LiveExecutiveMetrics />

        {/* 2. Yönetici özet kartları (örnek) */}
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

        {/* CRM Özeti */}
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Contact size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-content">CRM Özeti</h2>
            </div>
            <Link
              href="/crm"
              className="flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-content"
            >
              CRM&apos;i Aç
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {crmMetrics.slice(0, 4).map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.id}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-xl font-bold text-content">{metric.value}</p>
                  <p className="mt-0.5 text-xs text-muted">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>

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
