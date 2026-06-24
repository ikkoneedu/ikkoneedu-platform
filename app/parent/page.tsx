import type { Metadata } from "next";
import { AccountSummaryCard } from "@/components/shared/AccountSummaryCard";
import { MyChildren } from "@/components/parent/MyChildren";
import Link from "next/link";
import {
  CalendarDays,
  Bus,
  UtensilsCrossed,
  ChevronRight,
  type LucideIcon,
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
import { GlassCard } from "@/components/shared/GlassCard";
import { productName } from "@/lib/constants";
import { parentQuickActions } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Veli Portalı — ${productName}`,
  description:
    "Çocuğunuzun okul yaşamını, duyurularını ve gelişimini tek ekrandan takip edin.",
};

/** Dürüst "Yakında" kartı — sahte veri yerine net placeholder (premium görünüm). */
function ComingSoonCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          Yakında
        </span>
      </div>
      <h2 className="text-base font-semibold text-content">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
    </GlassCard>
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

        {/* Yakında gelecek veli özellikleri — dürüst placeholder (sahte veri yok). */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">Yakında</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ComingSoonCard
              icon={CalendarDays}
              title="Etkinlik Takvimi"
              description="Okul etkinlikleri ve veli toplantıları burada listelenecek."
            />
            <ComingSoonCard
              icon={UtensilsCrossed}
              title="Yemek Listesi"
              description="Haftalık yemek menüsü burada yayınlanacak."
            />
            <ComingSoonCard
              icon={Bus}
              title="Servis Takibi"
              description="Servis konumu ve tahmini varış süresi burada görünecek."
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
