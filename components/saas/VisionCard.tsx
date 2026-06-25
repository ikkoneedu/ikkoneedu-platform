import { Rocket } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { VisionTier } from "@/lib/saas-mock-data";

interface VisionCardProps {
  tiers: VisionTier[];
}

/**
 * Gelecek Vizyonu.
 * Platformun ölçeklenme hedeflerini ve gelir projeksiyonunu sunar.
 */
export function VisionCard({ tiers }: VisionCardProps) {
  return (
    <GlassCard className="ai-gradient border-accent/20 px-6 py-10 sm:px-10">
      <div className="flex items-center gap-2 text-accent">
        <Rocket size={20} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Gelecek Vizyonu
        </span>
      </div>

      <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-content sm:text-3xl">
        Türkiye&apos;nin Eğitim İşletim Sistemi
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
        İngiliz Kültür Kolejleri öncülüğünde geliştirilen ikkoneedu platformu;
        gelecekte yüzlerce okulun yönetim, iletişim ve yapay zeka süreçlerini
        yöneten merkezi bir eğitim teknolojileri ekosistemine dönüşecektir.
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
            <p className="text-sm font-semibold text-accent">{tier.schools}</p>
            <p className="mt-2 text-lg font-bold tracking-tight text-content">
              {tier.revenue}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
