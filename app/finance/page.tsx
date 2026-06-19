import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FinanceMetrics } from "@/components/finance/FinanceMetrics";
import { PaymentTable } from "@/components/finance/PaymentTable";
import { PendingPayments } from "@/components/finance/PendingPayments";
import { EarlyEnrollmentRevenue } from "@/components/finance/EarlyEnrollmentRevenue";
import { ScholarshipOverview } from "@/components/finance/ScholarshipOverview";
import { RevenueTrend } from "@/components/finance/RevenueTrend";
import { AiFinanceInsights } from "@/components/finance/AiFinanceInsights";
import { productName } from "@/lib/constants";
import {
  financeMetrics,
  payments,
  pendingPayments,
  earlyEnrollment,
  scholarships,
  revenueTrend,
  aiInsights,
} from "@/lib/finance-mock-data";

export const metadata: Metadata = {
  title: `Finans Merkezi — ${productName}`,
  description:
    "Tahsilat, gelir, ödeme ve kayıt gelirlerini tek ekrandan takip edin.",
};

export default function FinancePage() {
  return (
    <PageShell title="Finans Merkezi">
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Finans"
          title="Finans Merkezi"
          description="Tahsilat, gelir, ödeme ve kayıt gelirlerini tek ekrandan takip edin."
        />

        {/* 1. Metrik kartları */}
        <FinanceMetrics metrics={financeMetrics} />

        {/* 2. Tahsilat tablosu */}
        <PaymentTable rows={payments} />

        {/* 3 + 5. Bekleyen ödemeler + burs yönetimi */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PendingPayments items={pendingPayments} />
          <ScholarshipOverview items={scholarships} />
        </div>

        {/* 4. Erken kayıt gelir analizi */}
        <EarlyEnrollmentRevenue tiers={earlyEnrollment} />

        {/* 6. Gelir trendi */}
        <RevenueTrend data={revenueTrend} />

        {/* 7. AI finansal öngörüler */}
        <AiFinanceInsights insights={aiInsights} />
      </div>
    </PageShell>
  );
}
