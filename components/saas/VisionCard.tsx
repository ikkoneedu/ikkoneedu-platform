import { Rocket } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { getServerT } from "@/lib/i18n/server";
import type { VisionTier } from "@/lib/saas-mock-data";

interface VisionCardProps {
  tiers: VisionTier[];
}

/**
 * Gelecek Vizyonu.
 * Platformun ölçeklenme hedeflerini ve gelir projeksiyonunu sunar.
 */
export async function VisionCard({ tiers }: VisionCardProps) {
  const t = await getServerT();
  return (
    <GlassCard className="ai-gradient border-accent/20 px-6 py-10 sm:px-10">
      <div className="flex items-center gap-2 text-accent">
        <Rocket size={20} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          {t("panelSaas.vision.eyebrow")}
        </span>
      </div>

      <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-content sm:text-3xl">
        {t("panelSaas.vision.title")}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
        {t("panelSaas.vision.body")}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={[
              "rounded-2xl border bg-background/30 p-5 text-center",
              tier.highlight ? "border-accent/40 ring-1 ring-inset ring-accent/20" : "border-overlay/10",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-accent">{t(`panelSaas.vision.tier.${tier.id}.schools`)}</p>
            <p className="mt-2 text-lg font-bold tracking-tight text-content">
              {t(`panelSaas.vision.tier.${tier.id}.revenue`)}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
