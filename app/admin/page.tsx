"use client";

import {
  Plus,
  Bell,
  HelpCircle,
  Sparkles,
  CircleUser,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useT } from "@/components/i18n/LocaleProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AccountSummaryCard } from "@/components/shared/AccountSummaryCard";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TenantOverview } from "@/components/dashboard/TenantOverview";
import { LiveExecutiveMetrics } from "@/components/executive/LiveExecutiveMetrics";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { MeetingRequests } from "@/components/meetings/MeetingRequests";
import { AiInsightCard } from "@/components/dashboard/AiInsightCard";
import { PermissionDelegationPanel } from "@/components/admin/PermissionDelegationPanel";
import {
  productName,
  adminNavigationItems,
  adminMobileNavItems,
  adminTopbarLinks,
} from "@/lib/constants";

/* Kenar çubuğu alt alanı: birincil eylem + yardımcı bağlantılar */
function SidebarFooter() {
  const t = useT();
  return (
    <div className="space-y-4">
      <Link href="/exam-ai" className="block">
        <PrimaryButton
          variant="secondary"
          size="md"
          className="w-full border-accent/20 bg-accent/10 text-accent hover:bg-accent/20"
        >
          <Plus size={18} aria-hidden="true" />
          {t("dashAdmin.sidebar.createExam")}
        </PrimaryButton>
      </Link>

      <div className="space-y-1 border-t border-overlay/5 pt-4">
        <Link
          href="/notifications"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-overlay/[0.04] hover:text-content"
        >
          <Bell size={20} aria-hidden="true" />
          {t("dashAdmin.sidebar.notifications")}
        </Link>
        <Link
          href="/coming-soon"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-overlay/[0.04] hover:text-content"
        >
          <HelpCircle size={20} aria-hidden="true" />
          {t("dashAdmin.sidebar.help")}
        </Link>
      </div>
    </div>
  );
}

/* Üst çubuk sağ eylemleri */
function TopbarActions() {
  const t = useT();
  return (
    <>
      <Link href="/ai-brain">
        <PrimaryButton size="sm" className="bg-accent text-navy hover:bg-accent/90">
          <Sparkles size={16} aria-hidden="true" />
          AI Brain
        </PrimaryButton>
      </Link>
      <LanguageToggle className="rounded-full border-0 bg-transparent px-2 hover:bg-overlay/[0.06]" />
      <ThemeToggle className="rounded-full border-0 bg-transparent hover:bg-overlay/[0.06]" />
      <Link
        href="/profile"
        aria-label={t("dashAdmin.topbar.profileAria")}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-overlay/[0.06] hover:text-content"
      >
        <CircleUser size={20} aria-hidden="true" />
      </Link>
    </>
  );
}

export default function AdminPage() {
  const t = useT();
  return (
    <div className="mesh-bg min-h-screen w-full lg:pl-64">
      <Sidebar
        items={adminNavigationItems}
        activeId="panel"
        subtitle={t("dashAdmin.sidebar.subtitle")}
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
              title={t("dashAdmin.header.title")}
              description={t("dashAdmin.header.description")}
              action={
                <Link href="/executive">
                  <PrimaryButton variant="secondary" size="md">
                    <Download size={18} aria-hidden="true" />
                    {t("dashAdmin.header.reports")}
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

            {/* Görev bazlı yetki devri — yalnız Genel Müdür/Kurucu/Süper Admin görür. */}
            <div className="mb-10">
              <PermissionDelegationPanel />
            </div>

            {/* AI öngörüleri — dürüst "Yakında" (sahte metrik/grafik yok;
                gerçek veriler yukarıda TenantOverview + LiveExecutiveMetrics). */}
            <AiInsightCard eyebrow={t("dashAdmin.ai.eyebrow")}>
              {t("dashAdmin.ai.body")}{" "}
              <span className="text-glow font-bold text-accent">
                {t("dashAdmin.ai.soon")}
              </span>{" "}
              {t("dashAdmin.ai.bodyEnd")}
            </AiInsightCard>
          </div>
        </main>
      </div>

      <MobileBottomNav items={adminMobileNavItems} activeId="ana-sayfa" />
    </div>
  );
}
