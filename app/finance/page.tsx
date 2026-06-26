import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PaymentManager } from "@/components/finance/PaymentManager";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("panelFinance.meta.title", { product: productName }),
    description: t("panelFinance.meta.description"),
  };
}

export default async function FinancePage() {
  const t = await getServerT();
  return (
    <PageShell title={t("panelFinance.page.title")}>
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow={t("panelFinance.section.eyebrow")}
          title={t("panelFinance.section.title")}
          description={t("panelFinance.section.description")}
        />

        {/* Canlı ödeme yönetimi — GERÇEK Firestore (özet + tablo + tahsilat).
            Tahakkuk/tahsilat/bakiye/gecikme özetini ve öğrenci bazlı ödeme
            kayıtlarını içerir; mock metrik/tablo/trend bölümleri kaldırıldı
            (gerçek veri arkalı tek modül). Gelir trendi ve burs/erken kayıt
            analitiği veri omurgası oluşunca ayrı eklenecek. */}
        <PaymentManager />
      </div>
    </PageShell>
  );
}
