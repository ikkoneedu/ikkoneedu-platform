import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { CounselingNotesManager } from "@/components/counseling/CounselingNotesManager";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("panelFinance.counseling.meta.title", { product: productName }),
    description: t("panelFinance.counseling.meta.description"),
  };
}

export default async function CounselingPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("panelFinance.counseling.page.title")}>
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow={t("panelFinance.counseling.section.eyebrow")}
          title={t("panelFinance.counseling.section.title")}
          description={t("panelFinance.counseling.section.description")}
        />

        {/* Canlı rehberlik görüşme notları (gerçek Firestore).
            Mock metrik/izleme listesi/risk/AI bölümleri kaldırıldı; bu hassas
            alanda yalnızca gerçek kayıtlar gösterilir. */}
        <CounselingNotesManager />

        {/* Gizlilik ve yetki uyarısı (statik bilgilendirme) */}
        <GlassCard tone="navy" className="border-overlay/10">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-overlay/10 bg-navy/40 text-muted">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-content">
                {t("panelFinance.counseling.privacy.title")}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {t("panelFinance.counseling.privacy.body")}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  );
}
