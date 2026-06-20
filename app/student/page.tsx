import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  User,
  MapPin,
  CheckCircle2,
  Circle,
  Sparkles,
  Send,
  Languages,
  Compass,
  CalendarCheck,
  Trophy,
  CalendarClock,
  Megaphone,
  BookOpen,
  ListTodo,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StudentProfileCard } from "@/components/student/StudentProfileCard";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { AssignmentBoard } from "@/components/assignments/AssignmentBoard";
import { MessagingPanel } from "@/components/messaging/MessagingPanel";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Öğrenci Merkezi — ${productName}`,
  description: "Bugünkü programın, görevlerin ve başarıların tek yerde.",
};

/* ----------------------------- Mock veriler ------------------------------ */

const dailyProgram = [
  { id: "1", time: "09:00", lesson: "Matematik", teacher: "Ayşe Yılmaz", room: "A-204" },
  { id: "2", time: "10:00", lesson: "Türkçe", teacher: "Mehmet Demir", room: "B-110" },
  { id: "3", time: "11:00", lesson: "Fen Bilimleri", teacher: "Zeynep Kaya", room: "Lab-1" },
  { id: "4", time: "13:00", lesson: "İngilizce", teacher: "John Smith", room: "C-305" },
  { id: "5", time: "14:00", lesson: "Beden Eğitimi", teacher: "Ali Vural", room: "Spor Salonu" },
];

const tasks = [
  { id: "1", title: "Matematik — Problem Seti 5", done: true },
  { id: "2", title: "Fen — Deney Raporu", done: true },
  { id: "3", title: "Türkçe — Kompozisyon", done: false },
  { id: "4", title: "İngilizce — Kelime Çalışması", done: false },
  { id: "5", title: "Tarih — Okuma Ödevi", done: false },
];

const coachQuestions = [
  "Bugün ne çalışmalıyım?",
  "Matematikte hangi konular eksik?",
  "İngilizce seviyem nasıl?",
];

interface Badge {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  earned: boolean;
}

const badges: Badge[] = [
  { id: "ing", title: "İngilizce Uzmanı", detail: "B2 seviyesi", icon: Languages, earned: true },
  { id: "mat", title: "Matematik Kaşifi", detail: "30 problem", icon: Compass, earned: true },
  { id: "duzen", title: "Düzenli Öğrenci", detail: "21 gün seri", icon: CalendarCheck, earned: true },
  { id: "lider", title: "Haftanın Lideri", detail: "Sınıf 1.si", icon: Trophy, earned: false },
];

const upcomingExams = [
  { id: "1", date: "22 Haz", subject: "Matematik", daysLeft: 4 },
  { id: "2", date: "25 Haz", subject: "Fen Bilimleri", daysLeft: 7 },
  { id: "3", date: "28 Haz", subject: "İngilizce", daysLeft: 10 },
];

const performance = [
  { subject: "Matematik", score: 92 },
  { subject: "Fen", score: 85 },
  { subject: "İngilizce", score: 88 },
  { subject: "Türkçe", score: 79 },
];

const announcements = [
  { id: "1", title: "Bahar şenliği 30 Haziran'da yapılacaktır.", time: "2 saat önce" },
  { id: "2", title: "Kütüphane çalışma saatleri uzatıldı.", time: "1 gün önce" },
  { id: "3", title: "Yaz okulu ön kayıtları başladı.", time: "3 gün önce" },
];

/* ------------------------------- Sayfa ----------------------------------- */

export default function StudentPage() {
  const completed = tasks.filter((t) => t.done).length;
  const progress = Math.round((completed / tasks.length) * 100);

  return (
    <PageShell title="Öğrenci Merkezi">
      <div className="flex flex-col gap-12">
        <Reveal>
          <SectionHeader
            eyebrow="Öğrenci Merkezi"
            title="Merhaba Elif, hazır mısın? 👋"
            description="Bugünkü programın, görevlerin ve başarıların burada."
          />
        </Reveal>

        {/* Canlı öğrenci bilgisi (gerçek Firestore — yalnızca giriş yapmış öğrencide) */}
        <StudentProfileCard />

        {/* Okul duyuruları (canlı) */}
        <AnnouncementBoard />

        {/* Ödevler (canlı) */}
        <AssignmentBoard />

        {/* Mesajlaşma (canlı) */}
        <MessagingPanel />

        {/* 1. Günlük Program */}
        <Reveal>
          <section>
            <div className="mb-4 flex items-center gap-2 text-content">
              <BookOpen size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Günlük Program</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {dailyProgram.map((item) => (
                <GlassCard key={item.id} tone="navy" interactive className="p-5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-accent">
                    <Clock size={15} aria-hidden="true" />
                    {item.time}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-content">
                    {item.lesson}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                    <User size={13} aria-hidden="true" />
                    {item.teacher}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <MapPin size={13} aria-hidden="true" />
                    {item.room}
                  </p>
                </GlassCard>
              ))}
            </div>
          </section>
        </Reveal>

        {/* 2 + 3. Görevler ve AI Koç */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal className="h-full">
            <GlassCard tone="navy" className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo size={18} className="text-accent" aria-hidden="true" />
                  <h2 className="text-lg font-semibold text-content">
                    Bugünkü Görevler
                  </h2>
                </div>
                <span className="text-sm font-medium text-muted">
                  {completed}/{tasks.length}
                </span>
              </div>

              {/* İlerleme */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-muted">
                  <span>İlerleme</span>
                  <span className="font-semibold text-accent">%{progress}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <ul className="mt-5 space-y-2.5">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3">
                    {task.done ? (
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Circle size={18} className="shrink-0 text-muted" aria-hidden="true" />
                    )}
                    <span
                      className={
                        task.done
                          ? "text-sm text-muted line-through"
                          : "text-sm text-content"
                      }
                    >
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          {/* AI Study Coach */}
          <Reveal delay={0.1} className="h-full">
            <GlassCard className="ai-gradient flex h-full flex-col border-accent/20">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
                  <Sparkles size={22} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-content">
                    AI Study Coach
                  </h2>
                  <p className="text-xs text-muted">
                    Yapay zeka ders koçun her zaman yanında.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {coachQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-content transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-background/40 p-2 pl-4">
                  <input
                    type="text"
                    placeholder="Bir şey sor..."
                    className="flex-1 bg-transparent text-sm text-content placeholder:text-muted/60 focus:outline-none"
                  />
                  <PrimaryButton size="sm" aria-label="Gönder" className="!px-3">
                    <Send size={16} aria-hidden="true" />
                  </PrimaryButton>
                </div>
              </div>
            </GlassCard>
          </Reveal>
        </div>

        {/* 4. Başarı Rozetleri */}
        <Reveal>
          <section>
            <div className="mb-4 flex items-center gap-2 text-content">
              <Trophy size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Başarı Rozetleri</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <GlassCard
                    key={badge.id}
                    tone="navy"
                    interactive
                    className={[
                      "flex flex-col items-center p-5 text-center",
                      badge.earned ? "" : "opacity-50",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-14 w-14 items-center justify-center rounded-2xl border",
                        badge.earned
                          ? "border-accent/30 bg-accent/15 text-accent"
                          : "border-white/10 bg-white/[0.03] text-muted",
                      ].join(" ")}
                    >
                      <Icon size={26} aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-content">
                      {badge.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">{badge.detail}</p>
                  </GlassCard>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* 5 + 6. Yaklaşan Sınavlar ve Akademik Performans */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal className="h-full">
            <GlassCard tone="navy" className="flex h-full flex-col">
              <div className="mb-4 flex items-center gap-2">
                <CalendarClock size={18} className="text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-content">
                  Yaklaşan Sınavlar
                </h2>
              </div>
              <ul className="space-y-3">
                {upcomingExams.map((exam) => (
                  <li
                    key={exam.id}
                    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-navy/50 text-accent">
                      <span className="text-xs font-semibold">
                        {exam.date.split(" ")[0]}
                      </span>
                      <span className="text-[10px] uppercase text-muted">
                        {exam.date.split(" ")[1]}
                      </span>
                    </span>
                    <span className="flex-1 text-sm font-medium text-content">
                      {exam.subject}
                    </span>
                    <span className="shrink-0 rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      {exam.daysLeft} gün
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <GlassCard tone="navy" className="flex h-full flex-col">
              <h2 className="mb-5 text-lg font-semibold text-content">
                Akademik Performans
              </h2>
              <div className="flex flex-1 flex-col justify-center gap-4">
                {performance.map((item) => (
                  <div key={item.subject}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-content">{item.subject}</span>
                      <span className="font-semibold text-accent">{item.score}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>

        {/* 7. Son Duyurular */}
        <Reveal>
          <GlassCard tone="navy">
            <div className="mb-4 flex items-center gap-2">
              <Megaphone size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-content">Son Duyurular</h2>
            </div>
            <ul className="divide-y divide-white/5">
              {announcements.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-content">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted">{item.time}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </Reveal>
      </div>
    </PageShell>
  );
}
