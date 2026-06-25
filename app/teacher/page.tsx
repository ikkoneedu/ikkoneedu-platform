import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Sparkles, FileText, PenLine, ChevronRight } from "lucide-react";
import { AccountSummaryCard } from "@/components/shared/AccountSummaryCard";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TeacherRoster } from "@/components/teacher/TeacherRoster";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { AssignmentBoard } from "@/components/assignments/AssignmentBoard";
import { MessagingPanel } from "@/components/messaging/MessagingPanel";
import { GradeBoard } from "@/components/grades/GradeBoard";
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";
import { MyTimetable } from "@/components/teacher/MyTimetable";
import { MyClasses } from "@/components/teacher/MyClasses";
import { AttendanceBoard } from "@/components/attendance/AttendanceBoard";
import { MeetingRequests } from "@/components/meetings/MeetingRequests";
import { GlassCard } from "@/components/shared/GlassCard";
import { getServerT } from "@/lib/i18n/server";
import { productName } from "@/lib/constants";
import { teacherQuickActions } from "@/lib/mock-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: `${t("dash.teacher.metaTitle")} — ${productName}`,
    description: t("dash.teacher.metaDesc"),
  };
}

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

export default async function TeacherPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("dash.teacher.title")}>
      <div className="flex flex-col gap-10">
        <AccountSummaryCard />

        <SectionHeader
          eyebrow={t("dash.teacher.title")}
          title={t("dash.teacher.title")}
          description={t("dash.teacher.desc")}
        />

        {/* Kendi ders programım (canlı) + sıradaki ders hatırlatması */}
        <MyTimetable />

        {/* Bağlı sınıflarım + öğrenci listesi (gerçek Firestore — profile.classIds) */}
        <MyClasses />

        {/* Canlı sınıf listesi (gerçek Firestore — yalnızca giriş yapmış öğretmende) */}
        <TeacherRoster />

        {/* Duyuru panosu (canlı) */}
        <AnnouncementBoard />

        {/* Ödev panosu (canlı — öğretmen ödev verir) */}
        <div id="odev" className="scroll-mt-20">
          <AssignmentBoard />
        </div>

        {/* Mesajlaşma (canlı) */}
        <MessagingPanel />

        {/* Veli görüşme talepleri (canlı — öğretmen onaylar/reddeder) */}
        <MeetingRequests />

        {/* Notlar (canlı) */}
        <GradeBoard />

        {/* Ders programı (canlı) */}
        <div id="program" className="scroll-mt-20">
          <ScheduleBoard />
        </div>

        {/* Yoklama (canlı — öğretmen yoklama girer) */}
        <div id="yoklama" className="scroll-mt-20">
          <AttendanceBoard />
        </div>

        {/* Yakında gelecek öğretmen özellikleri — dürüst placeholder (sahte veri yok). */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">{t("dash.section.comingSoon")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ComingSoonCard
              icon={Sparkles}
              title={t("dash.teacher.soon.assistant.title")}
              description={t("dash.teacher.soon.assistant.desc")}
            />
            <ComingSoonCard
              icon={FileText}
              title={t("dash.teacher.soon.exam.title")}
              description={t("dash.teacher.soon.exam.desc")}
            />
            <ComingSoonCard
              icon={PenLine}
              title={t("dash.teacher.soon.report.title")}
              description={t("dash.teacher.soon.report.desc")}
            />
          </div>
        </section>

        {/* Hızlı İşlemler — gerçek bağlantılar */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">{t("dash.section.quickActions")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {teacherQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.id}
                  href={action.href ?? "/coming-soon"}
                  className="group flex flex-col items-start gap-3 rounded-2xl border border-overlay/10 bg-overlay/[0.04] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-overlay/[0.06]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-content">
                    {t(action.labelKey)}
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
