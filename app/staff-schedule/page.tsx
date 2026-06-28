import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { StaffScheduleManager } from "@/components/staff-ops/StaffScheduleManager";
import { StaffAlertsManager } from "@/components/staff-ops/StaffAlertsManager";
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
      <div className="flex flex-col gap-8">
        <StaffScheduleManager />
        <StaffAlertsManager />
      </div>
    </PageShell>
  );
}
