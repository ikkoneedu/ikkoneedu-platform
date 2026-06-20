"use client";

import {
  Plus,
  Bell,
  HelpCircle,
  Sparkles,
  Languages,
  Moon,
  CircleUser,
  Download,
  Star,
  StarHalf,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TenantOverview } from "@/components/dashboard/TenantOverview";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  productName,
  adminNavigationItems,
  adminMobileNavItems,
  adminTopbarLinks,
} from "@/lib/constants";
import {
  adminMetrics,
  campusPerformance,
  adminActivities,
  type AdminMetric,
} from "@/lib/mock-data";

/* Kenar çubuğu alt alanı: birincil eylem + yardımcı bağlantılar */
function SidebarFooter() {
  return (
    <div className="space-y-4">
      <PrimaryButton
        variant="secondary"
        size="md"
        className="w-full border-accent/20 bg-accent/10 text-accent hover:bg-accent/20"
      >
        <Plus size={18} aria-hidden="true" />
        Yeni Sınav Oluştur
      </PrimaryButton>

      <div className="space-y-1 border-t border-white/5 pt-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-content"
        >
          <Bell size={20} aria-hidden="true" />
          Bildirimler
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-content"
        >
          <HelpCircle size={20} aria-hidden="true" />
          Yardım
        </button>
      </div>
    </div>
  );
}

/* Üst çubuk sağ eylemleri */
function TopbarActions() {
  return (
    <>
      <PrimaryButton size="sm" className="bg-accent text-navy hover:bg-accent/90">
        <Sparkles size={16} aria-hidden="true" />
        AI Brain
      </PrimaryButton>
      <button
        type="button"
        aria-label="Dil"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-content"
      >
        <Languages size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Karanlık mod"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-content"
      >
        <Moon size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Profil"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-content"
      >
        <CircleUser size={20} aria-hidden="true" />
      </button>
    </>
  );
}

/* Metrik kartı alt görseli (sparkline / kapasite / puan) */
function MetricVisual({ metric }: { metric: AdminMetric }) {
  switch (metric.visual) {
    case "sparkline":
      return (
        <div className="relative h-10 w-full overflow-hidden rounded border-b-2 border-accent/50 bg-gradient-to-r from-accent/5 to-accent/20">
          <div
            className="absolute bottom-0 left-0 h-full w-full bg-accent/10"
            style={{
              clipPath:
                "polygon(0 100%, 10% 80%, 30% 90%, 50% 60%, 70% 70%, 90% 30%, 100% 40%, 100% 100%)",
            }}
          />
        </div>
      );
    case "sparkline-positive":
      return (
        <div className="relative h-10 w-full overflow-hidden rounded border-b-2 border-emerald-400/50 bg-gradient-to-r from-emerald-400/5 to-emerald-400/20">
          <div
            className="absolute bottom-0 left-0 h-full w-full bg-emerald-400/10"
            style={{
              clipPath:
                "polygon(0 100%, 20% 70%, 40% 80%, 60% 40%, 80% 50%, 100% 20%, 100% 100%)",
            }}
          />
        </div>
      );
    case "capacity":
      return (
        <div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent/70"
              style={{ width: `${metric.capacity ?? 0}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-muted">
            Kapasite: %{metric.capacity}
          </p>
        </div>
      );
    case "rating":
      return <StarRating value={metric.rating ?? 0} />;
    default:
      return null;
  }
}

/* Puan görseli: dolu / yarım / boş yıldızlar */
function StarRating({ value }: { value: number }) {
  return (
    <div className="mt-2 flex gap-1" aria-label={`${value} / 5 puan`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const position = index + 1;
        if (position <= Math.floor(value)) {
          return (
            <Star key={index} size={20} className="fill-accent text-accent" aria-hidden="true" />
          );
        }
        if (position - 0.5 <= value) {
          return (
            <StarHalf key={index} size={20} className="fill-accent text-accent" aria-hidden="true" />
          );
        }
        return <Star key={index} size={20} className="text-white/20" aria-hidden="true" />;
      })}
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="mesh-bg min-h-screen w-full lg:pl-64">
      <Sidebar
        items={adminNavigationItems}
        activeId="panel"
        subtitle="Eğitim İşletim Sistemi"
        footer={<SidebarFooter />}
      />

      <div className="flex min-h-screen flex-col">
        <Topbar
          title={productName}
          centerLinks={adminTopbarLinks}
          actions={<TopbarActions />}
        />

        <main className="flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-12 lg:pb-12">
          <div className="mx-auto w-full max-w-[1600px]">
            {/* Ana başlık */}
            <SectionHeader
              className="mb-10"
              title="Yönetim Paneli"
              description="Sistem genel görünümü ve stratejik performans metrikleri."
              action={
                <PrimaryButton variant="secondary" size="md">
                  <Download size={18} aria-hidden="true" />
                  Rapor Al
                </PrimaryButton>
              }
            />

            {/* Okul özeti — gerçek Firestore verisi (yalnızca giriş yapmış personelde görünür) */}
            <div className="mb-10">
              <TenantOverview />
            </div>

            {/* Metrik kartları */}
            <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {adminMetrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  delta={metric.delta}
                  trend={metric.trend}
                  icon={metric.icon}
                >
                  <MetricVisual metric={metric} />
                </MetricCard>
              ))}
            </section>

            {/* Ana düzen: sol (AI öngörü + grafik), sağ (aktiviteler) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <AiInsightCard eyebrow="AI Zekası Öngörüsü">
                  &ldquo;Yapay zeka analizlerine göre, uygulanan yeni müfredat
                  destek programı sayesinde bu hafta okul genel performansında{" "}
                  <span className="text-glow font-bold text-accent">
                    %5 artış
                  </span>{" "}
                  öngörülüyor.&rdquo;
                </AiInsightCard>

                <PerformanceChart
                  title="Kampüs Performans Analizi"
                  data={campusPerformance}
                />
              </div>

              <ActivityFeed title="Son Aktiviteler" items={adminActivities} />
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav items={adminMobileNavItems} activeId="ana-sayfa" />
    </div>
  );
}
