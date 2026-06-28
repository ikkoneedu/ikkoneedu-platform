import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { MyAttendanceHistory } from "@/components/staff-ops/MyAttendanceHistory";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: `${t("hist.title")} — ${productName}` };
}

export default async function MyHistoryPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("hist.title")}>
      <MyAttendanceHistory />
    </PageShell>
  );
}
