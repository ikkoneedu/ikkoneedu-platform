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
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AccountSummaryCard } from "@/components/shared/AccountSummaryCard";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TenantOverview } from "@/components/dashboard/TenantOverview";
import { LiveExecutiveMetrics } from "@/components/executive/LiveExecutiveMetrics";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { MeetingRequests } from "@/components/meetings/MeetingRequests";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import {
  productName,
  adminNavigationItems,
  adminMobileNavItems,
  adminTopbarLinks,
} from "@/lib/constants";

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

      <div className="space-y-1 border-t border-overlay/5 pt-4">
        <Link
          href="/notifications"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-overlay/[0.04] hover:text-content"
        >
          <Bell size={20} aria-hidden="true" />
          Bildirimler
        </Link>
        <Link
          href="/coming-soon"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-overlay/[0.04] hover:text-content"
        >
          <HelpCircle size={20} aria-hidden="true" />
          Yardım
        </Link>
      </div>
    </div>
  );
}

/* Üst çubuk sağ eylemleri */
function TopbarActions() {
  return (
    <>
      <Link href="/ai-brain">
        <PrimaryButton size="sm" className="bg-accent text-navy hover:bg-accent/90">
          <Sparkles size={16} aria-hidden="true" />
          AI Brain
        </PrimaryButton>
      </Link>
      <Link
        href="/coming-soon"
        aria-label="Dil (yakında)"
        title="Dil seçimi yakında"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-overlay/[0.06] hover:text-content"
      >
        <Languages size={18} aria-hidden="true" />
      </Link>
      <Link
        href="/coming-soon"
        aria-label="Karanlık mod (yakında)"
        title="Tema seçimi yakında"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-overlay/[0.06] hover:text-content"
      >
        <Moon size={18} aria-hidden="true" />
      </Link>
      <Link
        href="/profile"
        aria-label="Profil"
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-overlay/[0.06] hover:text-content"
      >
        <CircleUser size={20} aria-hidden="true" />
      </Link>
    </>
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
              className="mb-6"
              title="Yönetim Paneli"
              description="Sistem genel görünümü ve stratejik performans metrikleri."
              action={
                <Link href="/executive">
                  <PrimaryButton variant="secondary" size="md">
                    <Download size={18} aria-hidden="true" />
                    Raporlar
                  </PrimaryButton>
                </Link>
              }
            />

            <div className="mb-10">
              <AccountSummaryCard />
            </div>

            {/* Okul özeti — gerçek Firestore verisi (yalnızca giriş yapmış personelde görünür) */}
            <div className="mb-10">
              <TenantOverview />
            </div>

            {/* Canlı okul metrikleri (lead/randevu/bursluluk/tahsilat) */}
            <div className="mb-10">
              <LiveExecutiveMetrics />
            </div>

            {/* Duyuru panosu (canlı) */}
            <div className="mb-10">
              <AnnouncementBoard />
            </div>

            {/* Veli görüşme talepleri (canlı — yönetim onaylar/reddeder) */}
            <div className="mb-10">
              <MeetingRequests />
            </div>

            {/* AI öngörüleri — dürüst "Yakında" (sahte metrik/grafik yok;
                gerçek veriler yukarıda TenantOverview + LiveExecutiveMetrics). */}
            <AiInsightCard eyebrow="AI Zekası · Yakında">
              Yapay zeka destekli okul performans öngörüleri ve erken uyarı
              analizleri{" "}
              <span className="text-glow font-bold text-accent">yakında</span>{" "}
              bu alanda. Devamsızlık, akademik gidişat ve tahsilat verilerini
              birleştirip eyleme dönük öneriler sunacak.
            </AiInsightCard>
          </div>
        </main>
      </div>

      <MobileBottomNav items={adminMobileNavItems} activeId="ana-sayfa" />
    </div>
  );
}
