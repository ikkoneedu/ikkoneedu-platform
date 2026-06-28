import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { StaffQrCard } from "@/components/attendance/StaffQrCard";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: `${t("att.myqr.metaTitle")} — ${productName}` };
}

export default async function MyQrPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("att.myqr.title")}>
      <StaffQrCard />
    </PageShell>
  );
}
