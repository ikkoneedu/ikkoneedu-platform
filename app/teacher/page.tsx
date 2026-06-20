import type { Metadata } from "next";
import {
  BookOpen,
  School,
  BarChart3,
  PenLine,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TeacherRoster } from "@/components/teacher/TeacherRoster";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { AssignmentBoard } from "@/components/assignments/AssignmentBoard";
import { MessagingPanel } from "@/components/messaging/MessagingPanel";
import { GradeBoard } from "@/components/grades/GradeBoard";
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard";
import { AttendanceBoard } from "@/components/attendance/AttendanceBoard";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TeacherSchedule } from "@/components/teacher/TeacherSchedule";
import { ClassCard } from "@/components/teacher/ClassCard";
import { TeacherAiAssistant } from "@/components/teacher/TeacherAiAssistant";
import { AssignmentOverview } from "@/components/teacher/AssignmentOverview";
import { ExamBuilderPreview } from "@/components/teacher/ExamBuilderPreview";
import { ParentMessages } from "@/components/teacher/ParentMessages";
import { productName } from "@/lib/constants";
import {
  teacherSchedule,
  teacherClasses,
  teacherAiSuggestions,
  teacherAssignmentStats,
  teacherAssignments,
  teacherExamOptions,
  teacherPerformance,
  teacherParentMessages,
  teacherQuickActions,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `Öğretmen Portalı — ${productName}`,
  description:
    "Sınıflarınızı yönetin, içerik üretin ve öğrencilerinizin gelişimini yapay zeka desteğiyle takip edin.",
};

const performanceMetrics = [
  { key: "success" as const, label: "Genel Başarı" },
  { key: "participation" as const, label: "Katılım" },
  { key: "homework" as const, label: "Ödev Tamamlama" },
];

export default function TeacherPage() {
  return (
    <PageShell title="Öğretmen Portalı">
      <div className="flex flex-col gap-10">
        {/* 1. Karşılama */}
        <SectionHeader
          eyebrow="Öğretmen Portalı"
          title="Merhaba Ayşe Öğretmen 👋"
          description="Bugün 4 dersiniz, 2 bekleyen ödev kontrolünüz ve 1 veli mesajınız var."
        />

        {/* Canlı sınıf listesi (gerçek Firestore — yalnızca giriş yapmış öğretmende) */}
        <TeacherRoster />

        {/* Duyuru panosu (canlı) */}
        <AnnouncementBoard />

        {/* Ödev panosu (canlı) */}
        <AssignmentBoard />

        {/* Mesajlaşma (canlı) */}
        <MessagingPanel />

        {/* Notlar (canlı) */}
        <GradeBoard />

        {/* Ders programı (canlı) */}
        <ScheduleBoard />

        {/* Yoklama (canlı) */}
        <AttendanceBoard />

        {/* 2. Günlük Ders Programı */}
        <section>
          <div className="mb-4 flex items-center gap-2 text-content">
            <BookOpen size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Günlük Ders Programı</h2>
          </div>
          <TeacherSchedule lessons={teacherSchedule} />
        </section>

        {/* 3. Sınıflarım */}
        <section>
          <div className="mb-4 flex items-center gap-2 text-content">
            <School size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Sınıflarım</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {teacherClasses.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem} />
            ))}
          </div>
        </section>

        {/* 4. AI Öğretmen Asistanı */}
        <TeacherAiAssistant suggestions={teacherAiSuggestions} />

        {/* 5 + 6. Ödev Yönetimi ve Sınav Merkezi */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AssignmentOverview
            stats={teacherAssignmentStats}
            assignments={teacherAssignments}
          />
          <ExamBuilderPreview options={teacherExamOptions} />
        </div>

        {/* 7. Öğrenci Performans Analizi */}
        <GlassCard tone="navy">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">
              Öğrenci Performans Analizi
            </h2>
          </div>
          <div className="space-y-5">
            {teacherPerformance.map((row) => (
              <div key={row.classGroup}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-content">
                    {row.classGroup}
                  </span>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    Gelişim +%{row.trend}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.key}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted">{metric.label}</span>
                        <span className="font-semibold text-accent">
                          {row[metric.key]}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-accent/70"
                          style={{ width: `${row[metric.key]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 8 + 9. Veli Mesajları ve Karne Yorumu Asistanı */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ParentMessages messages={teacherParentMessages} />

          <GlassCard className="ai-gradient flex flex-col border-accent/20">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
                <PenLine size={22} aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold text-content">AI Karne Yorumu</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Öğrenci performansına göre profesyonel, pozitif ve gelişim odaklı
              karne yorumları oluşturun.
            </p>
            <PrimaryButton size="lg" className="mt-auto w-full sm:w-fit">
              Karne Yorumu Oluştur
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </GlassCard>
        </div>

        {/* 10. Hızlı İşlemler */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {teacherQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
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
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
