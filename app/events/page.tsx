import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EventsBoard } from "@/components/events/EventsBoard";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("schoolLife.events.meta.title", { product: productName }),
    description: t("schoolLife.events.meta.description"),
  };
}

export default async function EventsPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("schoolLife.events.page.title")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("schoolLife.events.section.eyebrow")}
          title={t("schoolLife.events.section.title")}
          description={t("schoolLife.events.section.description")}
        />
        <EventsBoard />
      </div>
    </PageShell>
  );
}
