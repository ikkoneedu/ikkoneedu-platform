import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SmartScheduleBuilder } from "@/components/scheduler/SmartScheduleBuilder";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: `AI Ders Programı Oluşturucu — ${productName}`,
    description: t("sched.demo.body"),
  };
}

export default async function SchedulerAiPage() {
  const t = await getServerT();
  return (
    <PageShell title="AI Ders Programı Oluşturucu">
      <div className="flex flex-col gap-10">
        {/* Çalışan demo şeridi — gerçek AI optimizasyonu sonraki faz */}
        <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-navy/50 text-accent">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-content">{t("sched.demo.title")}</p>
            <p className="mt-0.5 text-muted">{t("sched.demo.body")}</p>
          </div>
        </div>

        <SectionHeader
          eyebrow="Yapay Zeka"
          title="AI Ders Programı Oluşturucu"
          description="Öğretmen, sınıf ve ders kurallarını dikkate alarak çakışmasız haftalık ders programları oluşturun."
        />

        <SmartScheduleBuilder />
      </div>
    </PageShell>
  );
}
