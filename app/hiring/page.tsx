import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { CvReviewStudio } from "@/components/hiring/CvReviewStudio";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: `${t("hiring.meta.title")} — ${productName}`,
    description: t("hiring.meta.desc"),
  };
}

export default async function HiringPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("hiring.shell.title")}>
      <div className="flex flex-col gap-10">
        {/* Demo şeridi — gerçek AI sonraki faz */}
        <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-navy/50 text-accent">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-content">{t("hiring.demo.title")}</p>
            <p className="mt-0.5 text-muted">{t("hiring.demo.body")}</p>
          </div>
        </div>

        <SectionHeader
          eyebrow={t("hiring.header.eyebrow")}
          title={t("hiring.header.title")}
          description={t("hiring.header.desc")}
        />

        <CvReviewStudio />
      </div>
    </PageShell>
  );
}
