import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Sparkles,
  Trophy,
  Target,
  ArrowRight,
  NotebookPen,
  CalendarCheck,
  UtensilsCrossed,
  Bus,
} from "lucide-react";
import { AccountSummaryCard } from "@/components/shared/AccountSummaryCard";
import { MyRecord } from "@/components/student/MyRecord";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StudentProfileCard } from "@/components/student/StudentProfileCard";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { AssignmentBoard } from "@/components/assignments/AssignmentBoard";
import { MessagingPanel } from "@/components/messaging/MessagingPanel";
import { GradeBoard } from "@/components/grades/GradeBoard";
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";
import { AttendanceBoard } from "@/components/attendance/AttendanceBoard";
import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/landing/Reveal";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("dashStudent.metaTitle", { product: productName }),
    description: t("dashStudent.metaDesc"),
  };
}

/** Dürüst "Yakında" kartı — sahte veri yerine net placeholder (premium görünüm). */
function ComingSoonCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          {badge}
        </span>
      </div>
      <h2 className="text-base font-semibold text-content">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
    </GlassCard>
  );
}

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

export default async function StudentPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("dashStudent.title")}>
      <div className="flex flex-col gap-10">
        <AccountSummaryCard />

        {/* Kendi öğrenci kaydı (gerçek Firestore — profile.linkedStudentId) */}
        <MyRecord />

        <Reveal>
          <SectionHeader
            eyebrow={t("dashStudent.eyebrow")}
            title={t("dashStudent.title")}
            description={t("dashStudent.desc")}
          />
        </Reveal>

        {/* Canlı öğrenci bilgisi (gerçek Firestore — yalnızca giriş yapmış öğrencide) */}
        <StudentProfileCard />

        {/* Okul duyuruları (canlı — öğrenci yalnızca görüntüler) */}
        <AnnouncementBoard readOnly />

        {/* Ödevler (canlı — öğrenci yalnızca görüntüler) */}
        <AssignmentBoard readOnly />

        {/* Mesajlaşma (canlı — öğrenci öğretmenine mesaj gönderebilir) */}
        <MessagingPanel />

        {/* Notlar (canlı) */}
        <GradeBoard />

        {/* Ders programı (canlı — öğrenci yalnızca görüntüler) */}
        <ScheduleBoard readOnly />

        {/* Yoklama (canlı) */}
        <AttendanceBoard />

        {/* Okul yaşamı — gerçek modüller (ders planı, etkinlik, yemek, servis). */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">{t("dash.section.schoolLife")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureLinkCard
              href="/lesson-plans"
              icon={NotebookPen}
              title={t("dashStudent.feat.lessonPlans.title")}
              description={t("dashStudent.feat.lessonPlans.desc")}
            />
            <FeatureLinkCard
              href="/events"
              icon={CalendarCheck}
              title={t("dashStudent.feat.events.title")}
              description={t("dashStudent.feat.events.desc")}
            />
            <FeatureLinkCard
              href="/lunch-menu"
              icon={UtensilsCrossed}
              title={t("dashStudent.feat.lunch.title")}
              description={t("dashStudent.feat.lunch.desc")}
            />
            <FeatureLinkCard
              href="/bus-routes"
              icon={Bus}
              title={t("dashStudent.feat.bus.title")}
              description={t("dashStudent.feat.bus.desc")}
            />
          </div>
        </section>

        {/* Yakında gelecek öğrenci özellikleri — dürüst placeholder (sahte veri yok). */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">{t("dash.section.comingSoon")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ComingSoonCard
              icon={Sparkles}
              badge={t("dashStudent.soonBadge")}
              title={t("dashStudent.soon.coach.title")}
              description={t("dashStudent.soon.coach.desc")}
            />
            <ComingSoonCard
              icon={Trophy}
              badge={t("dashStudent.soonBadge")}
              title={t("dashStudent.soon.badges.title")}
              description={t("dashStudent.soon.badges.desc")}
            />
            <ComingSoonCard
              icon={Target}
              badge={t("dashStudent.soonBadge")}
              title={t("dashStudent.soon.goals.title")}
              description={t("dashStudent.soon.goals.desc")}
            />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
