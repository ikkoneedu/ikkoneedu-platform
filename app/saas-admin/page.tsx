import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SaasOverview } from "@/components/saas/SaasOverview";
import { DemoRequestsInbox } from "@/components/saas/DemoRequestsInbox";
import { SchoolTable } from "@/components/saas/SchoolTable";
import { NewSchoolForm } from "@/components/saas/NewSchoolForm";
import { SubscriptionCards } from "@/components/saas/SubscriptionCards";
import { RevenueAnalytics } from "@/components/saas/RevenueAnalytics";
import { AiUsageAnalytics } from "@/components/saas/AiUsageAnalytics";
import { TenantArchitecture } from "@/components/saas/TenantArchitecture";
import { LicenseTable } from "@/components/saas/LicenseTable";
import { PlatformHealth } from "@/components/saas/PlatformHealth";
import { VisionCard } from "@/components/saas/VisionCard";
import { productName } from "@/lib/constants";
import {
  saasOverviewMetrics,
  saasSchools,
  saasPlanTypes,
  saasSubscriptions,
  saasRevenueByMonth,
  saasRevenueMetrics,
  saasAiUsage,
  saasTenants,
  saasTenantFeatures,
  saasLicenses,
  saasPlatformHealth,
  saasVisionTiers,
} from "@/lib/saas-mock-data";

export const metadata: Metadata = {
  title: `SaaS Yönetim Merkezi — ${productName}`,
  description:
    "Tüm okulları, abonelikleri, kullanıcıları ve yapay zeka kullanımını tek merkezden yönetin.",
};

export default function SaasAdminPage() {
  return (
    <PageShell title="SaaS Yönetim Merkezi">
      <div className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Platform Yönetimi"
          title="SaaS Yönetim Merkezi"
          description="Tüm okulları, abonelikleri, kullanıcıları ve yapay zeka kullanımını tek merkezden yönetin."
        />

        {/* Demo talepleri — gerçek Firestore (canlı) */}
        <DemoRequestsInbox />

        {/* 1. Genel durum */}
        <SaasOverview metrics={saasOverviewMetrics} />

        {/* 2. Okullar listesi */}
        <SchoolTable schools={saasSchools} />

        {/* 3. Yeni okul ekle */}
        <NewSchoolForm plans={saasPlanTypes} />

        {/* 4. Abonelik yönetimi */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">
            Abonelik Yönetimi
          </h2>
          <SubscriptionCards subscriptions={saasSubscriptions} />
        </section>

        {/* 5. Gelir analitiği */}
        <RevenueAnalytics
          revenueByMonth={saasRevenueByMonth}
          metrics={saasRevenueMetrics}
        />

        {/* 6. AI kullanım analitiği */}
        <AiUsageAnalytics usage={saasAiUsage} />

        {/* 7. Tenant yönetimi */}
        <TenantArchitecture tenants={saasTenants} features={saasTenantFeatures} />

        {/* 8. Lisans ve paket durumu */}
        <LicenseTable licenses={saasLicenses} />

        {/* 9. Platform sağlığı */}
        <PlatformHealth metrics={saasPlatformHealth} />

        {/* 10. Gelecek vizyonu */}
        <VisionCard tiers={saasVisionTiers} />
      </div>
    </PageShell>
  );
}
