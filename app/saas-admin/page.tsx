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
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("panelSaas.meta.title", { product: productName }),
    description: t("panelSaas.meta.description"),
  };
}

export default async function SaasAdminPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("panelSaas.shell.title")}>
      <div className="flex flex-col gap-12">
        <SectionHeader
          eyebrow={t("panelSaas.header.eyebrow")}
          title={t("panelSaas.header.title")}
          description={t("panelSaas.header.description")}
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
