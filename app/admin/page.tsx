"use client";

import {
  Plus,
  Bell,
  HelpCircle,
  Sparkles,
  CircleUser,
  Download,
  Users,
  CalendarDays,
  School,
  MessageSquare,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useT } from "@/components/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AccountSummaryCard } from "@/components/shared/AccountSummaryCard";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
import { ROLES, type Role } from "@/lib/auth/role-constants";
import { canRoleAccess } from "@/lib/auth/route-config";

const PRINCIPAL_QUICK_LINKS = [
  { href: "/admin/records", labelKey: "nav.records", icon: School },
  { href: "/admin/users", labelKey: "nav.staff", icon: Users },
  { href: "/admin/timetable", labelKey: "nav.timetable", icon: CalendarDays },
  { href: "/teacher/classes", labelKey: "nav.myClasses", icon: BookOpen },
  { href: "/events", labelKey: "nav.events", icon: Bell },
  { href: "/attendance/logs", labelKey: "nav.attLogs", icon: ClipboardList },
] as const;

const VICE_PRINCIPAL_QUICK_LINKS = [
  { href: "/admin/records", labelKey: "nav.records", icon: School },
  { href: "/admin/timetable", labelKey: "nav.timetable", icon: CalendarDays },
  { href: "/teacher/classes", labelKey: "nav.myClasses", icon: BookOpen },
  { href: "/events", labelKey: "nav.events", icon: Bell },
  { href: "/notifications", labelKey: "nav.notifications", icon: Bell },
  { href: "/messages", labelKey: "nav.messages", icon: MessageSquare },
] as const;

function roleQuickLinks(role?: Role | null) {
  if (role === ROLES.PRINCIPAL) return PRINCIPAL_QUICK_LINKS;
  if (role === ROLES.VICE_PRINCIPAL) return VICE_PRINCIPAL_QUICK_LINKS;
  return [];
}

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

function RoleQuickAccess() {
  const { profile } = useAuth();
  const t = useT();
  const links = roleQuickLinks(profile?.role);
  if (links.length === 0) return null;

  const isPrincipal = profile?.role === ROLES.PRINCIPAL;
  return (
    <GlassCard tone="navy">
      <SectionHeader
        className="mb-5"
        eyebrow={t(isPrincipal ? "dashAdmin.roleFocus.principal.eyebrow" : "dashAdmin.roleFocus.vice.eyebrow")}
        title={t(isPrincipal ? "dashAdmin.roleFocus.principal.title" : "dashAdmin.roleFocus.vice.title")}
        description={t(isPrincipal ? "dashAdmin.roleFocus.principal.desc" : "dashAdmin.roleFocus.vice.desc")}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-overlay/[0.06]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-content group-hover:text-accent">
                {t(link.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default function AdminPage() {
  const t = useT();
  const { profile } = useAuth();
  const canOpenExecutive =
    !profile || canRoleAccess(profile.role, "/executive");
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
              action={canOpenExecutive ? (
                <Link href="/executive">
                  <PrimaryButton variant="secondary" size="md">
                    <Download size={18} aria-hidden="true" />
                    {t("dashAdmin.header.reports")}
                  </PrimaryButton>
                </Link>
              ) : undefined}
            />

            <div className="mb-10">
              <AccountSummaryCard />
            </div>

            <div className="mb-10">
              <RoleQuickAccess />
            </div>

            {/* Okul özeti — gerçek Firestore verisi (yalnızca giriş yapmış personelde görünür) */}
            <div className="mb-10">
              <TenantOverview />
            </div>

            {/* Canlı okul metrikleri (lead/randevu/bursluluk/tahsilat) */}
            {canOpenExecutive && (
              <div className="mb-10">
                <LiveExecutiveMetrics />
              </div>
            )}

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
