import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PickupWaitingBoard } from "@/components/attendance/PickupWaitingBoard";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: `${t("att.pickup.metaTitle")} — ${productName}` };
}

export default async function AttendancePickupPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("att.pickup.metaTitle")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("att.pickup.metaTitle")}
          title={t("att.pickup.title")}
          description={t("att.pickup.desc")}
        />
        <PickupWaitingBoard />
      </div>
    </PageShell>
  );
}
