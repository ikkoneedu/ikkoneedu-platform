import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PaymentManager } from "@/components/finance/PaymentManager";
import { productName } from "@/lib/constants";

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
          description="Öğrenci bazlı tahsilatı, bakiyeyi ve ödeme durumlarını tek ekrandan yönetin."
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
