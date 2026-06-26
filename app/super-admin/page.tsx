import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SuperAdminConsole } from "@/components/super-admin/SuperAdminConsole";
import { PlatformKpiStrip } from "@/components/super-admin/PlatformKpiStrip";
import { GlobalCrmPanel } from "@/components/super-admin/GlobalCrmPanel";
import { productName } from "@/lib/constants";
import { siteRoutes, type RouteStatus } from "@/lib/super-admin-data";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("panelSaas.super.meta.title", { product: productName }),
    description: t("panelSaas.super.meta.description"),
  };
}

const STATUS_STYLES: Record<RouteStatus, string> = {
  Hazır: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Geliştiriliyor: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Mock: "border-accent/20 bg-accent/10 text-accent",
};

export default async function SuperAdminPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("panelSaas.super.shell.title")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("panelSaas.super.header.eyebrow")}
          title={t("panelSaas.super.header.title")}
          description={t("panelSaas.super.header.description")}
        />

        <PlatformKpiStrip />

        <SuperAdminConsole />

        <SectionHeader
          eyebrow={t("panelSaas.super.crm.eyebrow")}
          title={t("panelSaas.super.crm.title")}
          description={t("panelSaas.super.crm.description")}
        />

        <GlobalCrmPanel />

        <SectionHeader
          eyebrow={t("panelSaas.super.routes.eyebrow")}
          title={t("panelSaas.super.routes.title")}
          description={t("panelSaas.super.routes.description")}
        />

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <span>{t("panelSaas.super.routes.totalPages", { count: siteRoutes.length })}</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400">{t("panelSaas.super.status.Hazır")}</span>
          <span className="text-amber-400">{t("panelSaas.super.status.Geliştiriliyor")}</span>
          <span className="text-accent">{t("panelSaas.super.status.Mock")}</span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {siteRoutes.map((entry) => (
            <GlassCard key={entry.id} tone="navy" interactive className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-content">{t(`panelSaas.route.${entry.id}.name`)}</h3>
                  <p className="mt-0.5 font-mono text-xs text-accent">{entry.route}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[entry.status]}`}>
                  {t(`panelSaas.super.status.${entry.status}`)}
                </span>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {t(`panelSaas.route.${entry.id}.desc`)}
              </p>

              <Link href={entry.route} className="mt-5 block">
                <PrimaryButton variant="secondary" size="sm" className="w-full">
                  {t("panelSaas.super.openPage")}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </PrimaryButton>
              </Link>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
