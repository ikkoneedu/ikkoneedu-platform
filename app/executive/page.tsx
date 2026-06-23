import type { Metadata } from "next";
import Link from "next/link";
import { Contact, ArrowRight, Wallet } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { ExecutiveHero } from "@/components/executive/ExecutiveHero";
import { LiveExecutiveMetrics } from "@/components/executive/LiveExecutiveMetrics";
import { StrategicActions } from "@/components/executive/StrategicActions";
import { productName } from "@/lib/constants";
import { strategicActions } from "@/lib/executive-mock-data";

export const metadata: Metadata = {
  title: `Executive Dashboard — ${productName}`,
  description:
    "Okulun öğrenci, kayıt, randevu, bursluluk ve tahsilat metriklerini tek ekrandan izleyin.",
};

/** Yönetici hızlı erişim kartı: sahte metrik yok, ilgili modüle yönlendirir. */
function QuickLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Contact;
}) {
  return (
    <Link href={href}>
      <GlassCard tone="navy" interactive className="flex h-full items-center gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold text-content">
            {title}
            <ArrowRight size={14} className="text-muted" aria-hidden="true" />
          </p>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
      </GlassCard>
    </Link>
  );
}

export default function ExecutivePage() {
  return (
    <PageShell title="Executive Dashboard">
      <div className="flex flex-col gap-10">
        {/* Başlık */}
        <ExecutiveHero />

        {/* Canlı okul metrikleri — GERÇEK toplama (öğrenci/öğretmen/veli/lead/
            randevu/bursluluk/tahsilat/bakiye). Tenant izole. */}
        <LiveExecutiveMetrics />

        {/* Hızlı erişim — ilgili gerçek modüllere yönlendirir (sahte metrik yok).
            Detaylı analitik (kayıt hunisi, akademik trend, memnuniyet) veri
            omurgası oluşunca ayrı eklenecek. */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <QuickLink
            href="/crm"
            title="CRM & Lead Yönetimi"
            description="Aday velileri, lead'leri ve randevuları yönetin."
            icon={Contact}
          />
          <QuickLink
            href="/finance"
            title="Finans Merkezi"
            description="Tahsilat, bakiye ve ödeme durumlarını izleyin."
            icon={Wallet}
          />
        </div>

        {/* Stratejik aksiyonlar — gerçek bağlantılar (rapor kısayolları) */}
        <StrategicActions actions={strategicActions} />
      </div>
    </PageShell>
  );
}
