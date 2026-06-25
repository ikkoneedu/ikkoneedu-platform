import { TrendingUp, PieChart, Handshake } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { getServerT } from "@/lib/i18n/server";
import type {
  RevenuePotential as RevenueTier,
  RevenueShare,
} from "@/lib/pricing-data";

interface RevenuePotentialProps {
  tiers: RevenueTier[];
  averageMonthly: number;
  share: RevenueShare;
}

/**
 * Gelir Potansiyeli kartı.
 * Professional (₺14.900/ay) ortalaması üzerinden ölçek bazlı gelir
 * projeksiyonu ve gelir paylaşımı modeli.
 */
export async function RevenuePotential({ tiers, averageMonthly, share }: RevenuePotentialProps) {
  const t = await getServerT();
  return (
    <GlassCard tone="navy">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Gelir Potansiyeli</h2>
      </div>
      <p className="mb-6 text-sm text-muted">
        Ortalama okul başı aylık gelir{" "}
        <span className="font-semibold text-accent">
          ₺{averageMonthly.toLocaleString("tr-TR")}
        </span>{" "}
        (Professional paketi) üzerinden hesaplanmıştır.
      </p>

      {/* Ölçek bazlı projeksiyon */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={[
              "rounded-2xl border p-5",
              tier.highlight
                ? "border-accent/40 bg-navy/40 ring-1 ring-inset ring-accent/20"
                : "border-overlay/10 bg-overlay/[0.03]",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-accent">{tier.schools}</p>
            <p className="mt-3 text-xl font-bold tracking-tight text-content">
              {tier.monthly}
            </p>
            <p className="mt-1 text-xs text-muted">{tier.yearly}</p>
          </div>
        ))}
      </div>

      {/* Gelir paylaşımı modeli */}
      <div className="mt-8 rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-6">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-accent" aria-hidden="true" />
          <h3 className="text-base font-semibold text-content">
            Gelir Paylaşımı Modeli
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-accent/20 bg-accent/10 p-4">
            <p className="text-2xl font-bold text-accent">%{share.ownerPercent}</p>
            <p className="mt-0.5 text-sm text-content">Proje Sahibi</p>
          </div>
          <div className="rounded-xl border border-overlay/10 bg-overlay/[0.04] p-4">
            <p className="text-2xl font-bold text-content">%{share.partnerPercent}</p>
            <p className="mt-0.5 text-sm text-content">İngiliz Kültür Kolejleri</p>
          </div>
        </div>

        {/* 50 okul senaryosu */}
        <div className="mt-5 border-t border-overlay/10 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Handshake size={16} className="text-accent" aria-hidden="true" />
            <span className="text-sm font-medium text-content">
              {share.scenarioLabel} için örnek paylaşım
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-overlay/[0.03] p-3">
              <p className="text-xs text-muted">Toplam yıllık gelir</p>
              <p className="mt-1 text-lg font-bold text-content">{share.totalYearly}</p>
            </div>
            <div className="rounded-lg bg-overlay/[0.03] p-3">
              <p className="text-xs text-muted">Proje sahibi payı</p>
              <p className="mt-1 text-lg font-bold text-accent">{share.ownerShare}</p>
            </div>
            <div className="rounded-lg bg-overlay/[0.03] p-3">
              <p className="text-xs text-muted">İngiliz Kültür Kolejleri payı</p>
              <p className="mt-1 text-lg font-bold text-content">{share.partnerShare}</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
