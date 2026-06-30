import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AttendanceLogs } from "@/components/attendance/AttendanceLogs";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: `${t("att.logs.metaTitle")} — ${productName}` };
}

export default async function AttendanceLogsPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("att.logs.metaTitle")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("att.logs.metaTitle")}
          title={t("att.logs.title")}
          description={t("att.logs.desc")}
        />
        <AttendanceLogs />
      </div>
    </PageShell>
  );
}
