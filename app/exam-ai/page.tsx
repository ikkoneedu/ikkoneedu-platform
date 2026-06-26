import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ExamGeneratorStudio } from "@/components/exam/ExamGeneratorStudio";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: `${t("exam.meta.title")} — ${productName}`,
    description: t("exam.meta.desc"),
  };
}

export default async function ExamAiPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("exam.shell.title")}>
      <div className="flex flex-col gap-10">
        {/* Çalışan demo şeridi — gerçek AI üretimi sonraki faz */}
        <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-navy/50 text-accent">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-content">{t("exam.demo.title")}</p>
            <p className="mt-0.5 text-muted">{t("exam.demo.body")}</p>
          </div>
        </div>

        <SectionHeader
          eyebrow={t("exam.header.eyebrow")}
          title={t("exam.header.title")}
          description={t("exam.header.desc")}
        />

        <ExamGeneratorStudio />
      </div>
    </PageShell>
  );
}
