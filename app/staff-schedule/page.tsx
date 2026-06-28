import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { StaffScheduleManager } from "@/components/staff-ops/StaffScheduleManager";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: `${t("sched2.title")} — ${productName}` };
}

export default async function StaffSchedulePage() {
  const t = await getServerT();
  return (
    <PageShell title={t("sched2.title")}>
      <StaffScheduleManager />
    </PageShell>
  );
}
