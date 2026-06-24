import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LunchMenuBoard } from "@/components/lunch/LunchMenuBoard";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Yemek Listesi — ${productName}`,
  description: "Okul yemek menüsü: günlük öğünler.",
};

export default function LunchMenuPage() {
  return (
    <PageShell title="Yemek Listesi">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Okul Yaşamı"
          title="Yemek Listesi"
          description="Günlük yemek menüsünü görüntüleyin; yetkili personel menü ekler."
        />
        <LunchMenuBoard />
      </div>
    </PageShell>
  );
}
