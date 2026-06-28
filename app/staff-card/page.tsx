import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StaffIdCard } from "@/components/staff-card/StaffIdCard";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: `${t("card.metaTitle")} — ${productName}` };
}

export default async function StaffCardPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("card.title")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("card.metaTitle")}
          title={t("card.title")}
          description={t("card.desc")}
        />
        <StaffIdCard />
      </div>
    </PageShell>
  );
}
