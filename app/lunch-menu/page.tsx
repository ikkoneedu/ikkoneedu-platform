import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LunchMenuBoard } from "@/components/lunch/LunchMenuBoard";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("schoolLife.lunch.meta.title", { product: productName }),
    description: t("schoolLife.lunch.meta.description"),
  };
}

export default async function LunchMenuPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("schoolLife.lunch.page.title")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("schoolLife.lunch.section.eyebrow")}
          title={t("schoolLife.lunch.section.title")}
          description={t("schoolLife.lunch.section.description")}
        />
        <LunchMenuBoard />
      </div>
    </PageShell>
  );
}
