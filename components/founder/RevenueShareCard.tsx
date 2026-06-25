"use client";

import { PieChart } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";
import type { FounderRevenueShare } from "@/lib/founder-mock-data";

interface RevenueShareCardProps {
  share: FounderRevenueShare;
}

/**
 * Gelir Paylaşım Modeli.
 * %70 / %30 paylaşımı ve 50 okul örnek senaryosu.
 */
export function RevenueShareCard({ share }: RevenueShareCardProps) {
  const t = useT();
  const ownerLabel = t("founderSchool.revenue.ownerLabel");
  const partnerLabel = t("founderSchool.revenue.partnerLabel");
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow={t("founderSchool.revenue.eyebrow")}
          title={t("founderSchool.revenue.title")}
        />
      </Reveal>

      <Reveal>
        <GlassCard tone="navy" className="mt-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center">
              <p className="text-4xl font-bold tracking-tight text-accent">
                %{share.ownerPercent}
              </p>
              <p className="mt-1 text-sm font-medium text-content">{ownerLabel}</p>
            </div>
            <div className="rounded-2xl border border-overlay/10 bg-overlay/[0.04] p-6 text-center">
              <p className="text-4xl font-bold tracking-tight text-content">
                %{share.partnerPercent}
              </p>
              <p className="mt-1 text-sm font-medium text-content">{partnerLabel}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-6">
            <div className="mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-accent" aria-hidden="true" />
              <span className="text-sm font-semibold text-content">
                {t("founderSchool.revenue.scenario", {
                  scenario: t("founderSchool.revenue.scenarioLabel"),
                })}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-overlay/[0.03] p-4 text-center">
                <p className="text-xs text-muted">{t("founderSchool.revenue.yearlyRevenue")}</p>
                <p className="mt-1 text-xl font-bold text-content">{share.totalYearly}</p>
              </div>
              <div className="rounded-xl bg-overlay/[0.03] p-4 text-center">
                <p className="text-xs text-muted">{ownerLabel}</p>
                <p className="mt-1 text-xl font-bold text-accent">{share.ownerShare}</p>
              </div>
              <div className="rounded-xl bg-overlay/[0.03] p-4 text-center">
                <p className="text-xs text-muted">{partnerLabel}</p>
                <p className="mt-1 text-xl font-bold text-content">{share.partnerShare}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
