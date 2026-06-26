import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BusRoutesBoard } from "@/components/bus/BusRoutesBoard";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("schoolLife.bus.meta.title", { product: productName }),
    description: t("schoolLife.bus.meta.description"),
  };
}

export default async function BusRoutesPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("schoolLife.bus.page.title")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("schoolLife.bus.section.eyebrow")}
          title={t("schoolLife.bus.section.title")}
          description={t("schoolLife.bus.section.description")}
        />
        <BusRoutesBoard />
      </div>
    </PageShell>
  );
}
