import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AttendanceScanner } from "@/components/attendance/AttendanceScanner";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: `${t("att.scan.metaTitle")} — ${productName}` };
}

export default async function ScannerPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("att.scan.title")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("att.scan.title")}
          title={t("att.scan.title")}
          description={t("att.scan.desc")}
        />
        <AttendanceScanner />
      </div>
    </PageShell>
  );
}
