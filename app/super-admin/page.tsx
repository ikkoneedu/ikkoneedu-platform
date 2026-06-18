import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";
import { siteRoutes, type RouteStatus } from "@/lib/super-admin-data";

export const metadata: Metadata = {
  title: `Super Admin — ${productName}`,
  description: "Tüm sayfalara tek merkezden erişim (geliştirme/demo paneli).",
};

const STATUS_STYLES: Record<RouteStatus, string> = {
  Hazır: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Geliştiriliyor: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Mock: "border-accent/20 bg-accent/10 text-accent",
};

export default function SuperAdminPage() {
  return (
    <PageShell title="Super Admin">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Erişim Merkezi"
          title="Super Admin Paneli"
          description="Geliştirme ve demo süreci için tüm sayfalara tek merkezden erişin."
        />

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <span>Toplam {siteRoutes.length} sayfa</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400">Hazır</span>
          <span className="text-amber-400">Geliştiriliyor</span>
          <span className="text-accent">Mock</span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {siteRoutes.map((entry) => (
            <GlassCard key={entry.id} tone="navy" interactive className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-content">{entry.name}</h3>
                  <p className="mt-0.5 font-mono text-xs text-accent">{entry.route}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[entry.status]}`}>
                  {entry.status}
                </span>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {entry.description}
              </p>

              <Link href={entry.route} className="mt-5 block">
                <PrimaryButton variant="secondary" size="sm" className="w-full">
                  Sayfayı Aç
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
