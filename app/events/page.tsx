import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EventsBoard } from "@/components/events/EventsBoard";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Etkinlikler — ${productName}`,
  description: "Okul etkinlik takvimi: yaklaşan etkinlikler ve detayları.",
};

export default function EventsPage() {
  return (
    <PageShell title="Etkinlikler">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Okul Yaşamı"
          title="Etkinlik Takvimi"
          description="Okulun yaklaşan etkinliklerini görüntüleyin; yetkili personel yeni etkinlik ekler."
        />
        <EventsBoard />
      </div>
    </PageShell>
  );
}
