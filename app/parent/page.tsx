import type { Metadata } from "next";
import { AccountSummaryCard } from "@/components/shared/AccountSummaryCard";
import { MyChildren } from "@/components/parent/MyChildren";
import Link from "next/link";
import {
  CalendarDays,
  Bus,
  UtensilsCrossed,
  ChevronRight,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ParentChildCard } from "@/components/parent/ParentChildCard";
import { ParentSummary } from "@/components/parent/ParentSummary";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { AssignmentBoard } from "@/components/assignments/AssignmentBoard";
import { MessagingPanel } from "@/components/messaging/MessagingPanel";
import { MeetingRequests } from "@/components/meetings/MeetingRequests";
import { GradeBoard } from "@/components/grades/GradeBoard";
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";
import { AttendanceBoard } from "@/components/attendance/AttendanceBoard";
import { ParentFinanceCard } from "@/components/parent/ParentFinanceCard";
import { GlassCard } from "@/components/shared/GlassCard";
import { productName } from "@/lib/constants";
import { parentQuickActions } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Veli Portalı — ${productName}`,
  description:
    "Çocuğunuzun okul yaşamını, duyurularını ve gelişimini tek ekrandan takip edin.",
};

/** Okul yaşamı modülüne yönlendiren kart (gerçek sayfa). */
function FeatureLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <GlassCard tone="navy" interactive className="flex h-full flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
            <Icon size={20} aria-hidden="true" />
          </span>
          <ArrowRight size={16} className="text-muted" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-content">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
      </GlassCard>
    </Link>
  );
}

export default function ParentPage() {
  return (
    <PageShell title="Veli Portalı">
      <div className="flex flex-col gap-10">
        <AccountSummaryCard />

        <SectionHeader
          eyebrow="Veli Portalı"
          title="Veli Portalı"
          description="Çocuğunuzun okul yaşamını, duyurularını ve gelişimini tek ekrandan takip edin."
        />

        {/* Bağlı öğrenciler (gerçek Firestore — profile.linkedStudentIds kapsamı) */}
        <MyChildren />

        {/* Canlı bağlı öğrenci (gerçek Firestore — yalnızca giriş yapmış velide) */}
        <ParentChildCard />

        {/* Canlı özet — çocuğun not/yoklama/ödev sayıları */}
        <ParentSummary />

        {/* Okul duyuruları (canlı — veli yalnızca görüntüler) */}
        <AnnouncementBoard readOnly />

        {/* Ödevler (canlı — veli yalnızca görüntüler) */}
        <AssignmentBoard readOnly />

        {/* Mesajlaşma (canlı — veli öğretmene mesaj gönderebilir) */}
        <MessagingPanel />

        {/* Öğretmen görüşmesi (canlı — veli randevu talep eder, durumunu görür) */}
        <MeetingRequests />

        {/* Notlar (canlı — "Notları/Raporları İncele" buraya kaydırır) */}
        <div id="notlar" className="scroll-mt-20">
          <GradeBoard />
        </div>

        {/* Ders programı (canlı — veli yalnızca görüntüler) */}
        <ScheduleBoard readOnly />

        {/* Yoklama (canlı) */}
        <AttendanceBoard />

        {/* Ödeme durumu (canlı — bağlı öğrenci) */}
        <ParentFinanceCard />

        {/* Okul yaşamı — gerçek modüller (etkinlik, yemek, servis). */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">Okul Yaşamı</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FeatureLinkCard
              href="/events"
              icon={CalendarDays}
              title="Etkinlik Takvimi"
              description="Okul etkinliklerini ve veli toplantılarını görüntüleyin."
            />
            <FeatureLinkCard
              href="/lunch-menu"
              icon={UtensilsCrossed}
              title="Yemek Listesi"
              description="Günlük yemek menüsünü görüntüleyin."
            />
            <FeatureLinkCard
              href="/bus-routes"
              icon={Bus}
              title="Servis Takibi"
              description="Servis rotalarını, durakları ve saatleri görüntüleyin."
            />
          </div>
        </section>

        {/* Hızlı İşlemler — gerçek bağlantılar */}
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
