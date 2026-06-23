import type { Metadata } from "next";
import { AccountSummaryCard } from "@/components/shared/AccountSummaryCard";
import { MyChildren } from "@/components/parent/MyChildren";
import Link from "next/link";
import {
  Megaphone,
  CalendarDays,
  MessageSquare,
  Bus,
  Navigation,
  CreditCard,
  FileText,
  ChevronRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ParentChildCard } from "@/components/parent/ParentChildCard";
import { ParentSummary } from "@/components/parent/ParentSummary";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { AssignmentBoard } from "@/components/assignments/AssignmentBoard";
import { MessagingPanel } from "@/components/messaging/MessagingPanel";
import { GradeBoard } from "@/components/grades/GradeBoard";
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";
import { AttendanceBoard } from "@/components/attendance/AttendanceBoard";
import { ParentFinanceCard } from "@/components/parent/ParentFinanceCard";
import { StatCard } from "@/components/shared/StatCard";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { StudentSwitcher } from "@/components/parent/StudentSwitcher";
import { AnnouncementCard } from "@/components/parent/AnnouncementCard";
import { LunchMenuCard } from "@/components/parent/LunchMenuCard";
import { EventCard } from "@/components/parent/EventCard";
import { ParentAiAssistant } from "@/components/parent/ParentAiAssistant";
import { productName } from "@/lib/constants";
import {
  parentStudents,
  parentMetrics,
  parentAnnouncements,
  parentLunchMenu,
  parentEvents,
  parentTeacherMessages,
  parentServiceStatus,
  parentPaymentInfo,
  parentAiSuggestions,
  parentQuickActions,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Veli Portalı — ${productName}`,
  description:
    "Çocuğunuzun okul yaşamını, duyurularını ve gelişimini tek ekrandan takip edin.",
};

export default function ParentPage() {
  return (
    <PageShell title="Veli Portalı">
      <div className="flex flex-col gap-10">
        <AccountSummaryCard />

        <SectionHeader
          eyebrow="Veli Portalı"
          title="Hoş geldiniz, Yılmaz Ailesi"
          description="Çocuğunuzun okul yaşamını, duyurularını ve gelişimini tek ekrandan takip edin."
        />

        {/* Bağlı öğrenciler (gerçek Firestore — profile.linkedStudentIds kapsamı) */}
        <MyChildren />

        {/* Canlı bağlı öğrenci (gerçek Firestore — yalnızca giriş yapmış velide) */}
        <ParentChildCard />

        {/* Canlı özet — çocuğun not/yoklama/ödev sayıları */}
        <ParentSummary />

        {/* Okul duyuruları (canlı) */}
        <AnnouncementBoard />

        {/* Ödevler (canlı) */}
        <AssignmentBoard />

        {/* Mesajlaşma (canlı) */}
        <MessagingPanel />

        {/* Notlar (canlı) */}
        <GradeBoard />

        {/* Ders programı (canlı) */}
        <ScheduleBoard />

        {/* Yoklama (canlı) */}
        <AttendanceBoard />

        {/* Ödeme durumu (canlı — bağlı öğrenci) */}
        <ParentFinanceCard />

        {/* 1. Öğrenci Seçimi */}
        <StudentSwitcher students={parentStudents} />

        {/* 2. Genel Durum Kartları */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {parentMetrics.map((metric) => (
            <StatCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              delta={metric.delta || undefined}
              trend={metric.trend}
              icon={metric.icon}
            />
          ))}
        </div>

        {/* Ana düzen */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sol kolon (geniş) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* 3. Güncel Duyurular */}
            <section>
              <div className="mb-4 flex items-center justify-between gap-2 text-content">
                <div className="flex items-center gap-2">
                  <Megaphone size={18} className="text-accent" aria-hidden="true" />
                  <h2 className="text-lg font-semibold">Güncel Duyurular</h2>
                </div>
                <Link
                  href="/notifications"
                  className="text-sm font-medium text-accent transition-colors hover:text-content"
                >
                  Tüm Bildirimler
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {parentAnnouncements.map((item) => (
                  <AnnouncementCard key={item.id} announcement={item} />
                ))}
              </div>
            </section>

            {/* 5. Etkinlik Takvimi */}
            <GlassCard tone="navy">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays size={18} className="text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-content">Etkinlik Takvimi</h2>
              </div>
              <div className="space-y-3">
                {parentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </GlassCard>

            {/* 6. Öğretmen Mesajları */}
            <GlassCard tone="navy">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-content">Öğretmen Mesajları</h2>
              </div>
              <ul className="divide-y divide-white/5">
                {parentTeacherMessages.map((message) => (
                  <li key={message.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/50 text-accent">
                      <MessageSquare size={16} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-content">
                          {message.sender}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          {message.unread && (
                            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">
                              Okunmamış
                            </span>
                          )}
                          <span className="text-xs text-muted">{message.time}</span>
                        </div>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {message.preview}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/messages" className="mt-4 block">
                <PrimaryButton variant="secondary" size="sm" className="w-full">
                  <MessageSquare size={16} aria-hidden="true" />
                  Mesaj Merkezi
                </PrimaryButton>
              </Link>
            </GlassCard>
          </div>

          {/* Sağ kolon (dar) */}
          <div className="flex flex-col gap-6">
            {/* 4. Yemek Listesi */}
            <LunchMenuCard menu={parentLunchMenu} />

            {/* 7. Servis Takibi */}
            <GlassCard tone="navy">
              <div className="mb-4 flex items-center gap-2">
                <Bus size={18} className="text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-content">Servis Takibi</h2>
              </div>
              <div className="rounded-xl border border-accent/20 bg-navy/40 p-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-sm font-semibold text-content">
                    {parentServiceStatus.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted">Tahmini varış</span>
                  <span className="text-sm font-semibold text-accent">
                    {parentServiceStatus.eta}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-muted">
                  <Navigation size={13} aria-hidden="true" />
                  {parentServiceStatus.route}
                </div>
              </div>
            </GlassCard>

            {/* 8. Ödeme ve Finans */}
            <GlassCard tone="navy">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-content">Ödeme ve Finans</h2>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm font-medium text-emerald-400">
                {parentPaymentInfo.pending}
              </div>
              <p className="mt-3 text-xs text-muted">
                Son ödeme: {parentPaymentInfo.lastPayment}
              </p>
              <Link href="/coming-soon" className="mt-4 block">
                <PrimaryButton variant="secondary" size="sm" className="w-full">
                  <FileText size={16} aria-hidden="true" />
                  Dekontlar ve Ödeme Geçmişi
                </PrimaryButton>
              </Link>
            </GlassCard>
          </div>
        </div>

        {/* 9. AI Veli Asistanı */}
        <ParentAiAssistant suggestions={parentAiSuggestions} />

        {/* 10. Hızlı İşlemler */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {parentQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.id}
                  href={action.href ?? "/coming-soon"}
                  className="group flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white/[0.06]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-content">
                    {action.label}
                    <ChevronRight
                      size={14}
                      className="text-muted transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
