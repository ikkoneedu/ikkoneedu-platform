import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { RealCrmMetrics } from "@/components/crm/RealCrmMetrics";
import { RealLeadPipeline } from "@/components/crm/RealLeadPipeline";
import { RealLeadSources } from "@/components/crm/RealLeadSources";
import { NewLeadForm } from "@/components/crm/NewLeadForm";
import { CrmInbox } from "@/components/crm/CrmInbox";
import { AppointmentManager } from "@/components/crm/AppointmentManager";
import { productName } from "@/lib/constants";
import { crmActions } from "@/lib/crm-mock-data";

export const metadata: Metadata = {
  title: `CRM & Lead Yönetimi — ${productName}`,
  description:
    "Aday velileri, görüşmeleri ve kayıt süreçlerini tek merkezden yönetin.",
};

/* Hızlı İşlemler — crmActions verisiyle */
function CrmQuickActions() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Zap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Hızlı İşlemler</h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {crmActions.map((action) => {
          const Icon = action.icon;
          const className =
            "group flex items-center gap-3 rounded-xl border border-overlay/10 bg-overlay/[0.04] p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-overlay/[0.06]";
          return (
            <Link
              key={action.id}
              href={action.href ?? "/coming-soon"}
              className={className}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="flex-1 text-sm font-medium text-content">{action.label}</span>
              <ArrowRight size={15} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default function CrmPage() {
  return (
    <PageShell title="CRM & Lead Yönetimi">
      <div className="flex flex-col gap-10">
        {/* 1. Başlık */}
        <SectionHeader
          eyebrow="Satış & Kayıt"
          title="CRM & Lead Yönetimi"
          description="Aday velileri, görüşmeleri ve kayıt süreçlerini tek merkezden yönetin."
        />

        {/* Genel metrikler — GERÇEK (lead + randevu sayımları, tenant izole) */}
        <RealCrmMetrics />

        {/* Gerçek gelen kutusu — bursluluk başvuruları + lead'ler (canlı) */}
        <CrmInbox />

        {/* Yeni lead ekle (Firestore'a yazar) */}
        <NewLeadForm />

        {/* Pipeline — GERÇEK Firestore lead'leri (tenant izole) */}
        <RealLeadPipeline />

        {/* Lead kaynakları (gerçek) + randevu yönetimi (gerçek) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RealLeadSources />
          <CrmQuickActions />
        </div>

        {/* Randevu yönetimi — GERÇEK Firestore (aday veli görüşmeleri) */}
        <AppointmentManager />
      </div>
    </PageShell>
  );
}
