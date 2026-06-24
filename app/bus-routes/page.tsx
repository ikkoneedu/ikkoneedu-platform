import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BusRoutesBoard } from "@/components/bus/BusRoutesBoard";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Servis Takibi — ${productName}`,
  description: "Okul servis rotaları, duraklar ve saatler.",
};

export default function BusRoutesPage() {
  return (
    <PageShell title="Servis Takibi">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Okul Yaşamı"
          title="Servis Takibi"
          description="Servis rotalarını, durakları ve saatleri görüntüleyin; yetkili personel rota ekler."
        />
        <BusRoutesBoard />
      </div>
    </PageShell>
  );
}
