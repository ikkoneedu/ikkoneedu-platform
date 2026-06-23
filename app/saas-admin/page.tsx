import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { RealSaasOverview } from "@/components/saas/RealSaasOverview";
import { DemoRequestsInbox } from "@/components/saas/DemoRequestsInbox";
import { PlatformLeadsInbox } from "@/components/saas/PlatformLeadsInbox";
import { TenantManagement } from "@/components/saas/TenantManagement";
import { RealSchoolTable } from "@/components/saas/RealSchoolTable";
import { NewSchoolForm } from "@/components/saas/NewSchoolForm";
import { VisionCard } from "@/components/saas/VisionCard";
import { productName } from "@/lib/constants";
import { saasPlanTypes, saasVisionTiers } from "@/lib/saas-mock-data";

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

        {/* Genel durum — GERÇEK (okul/lead/demo sayımları) */}
        <RealSaasOverview />

        {/* Demo talepleri — gerçek Firestore (canlı) */}
        <DemoRequestsInbox />

        {/* Platform satış lead pipeline'ı — demo dönüşümlerinden (canlı) */}
        <PlatformLeadsInbox />

        {/* Tenant onboarding + tenant/okul/admin yönetimi (gerçek Firestore) */}
        <TenantManagement />

        {/* Okullar listesi — GERÇEK Firestore (kök schools) */}
        <RealSchoolTable />

        {/* Yeni okul ekle (gerçek Firestore'a yazar) */}
        <NewSchoolForm plans={saasPlanTypes} />

        {/* Gelecek vizyonu (bilgilendirici — abonelik/gelir/AI fazları sonra) */}
        <VisionCard tiers={saasVisionTiers} />
      </div>
    </PageShell>
  );
}
