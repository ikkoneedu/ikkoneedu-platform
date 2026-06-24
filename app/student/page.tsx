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

export const metadata: Metadata = {
  title: `Öğrenci Merkezi — ${productName}`,
  description: "Programın, ödevlerin, notların ve duyuruların tek yerde.",
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

export default function StudentPage() {
  return (
    <PageShell title="Öğrenci Merkezi">
      <div className="flex flex-col gap-10">
        <AccountSummaryCard />

        {/* Kendi öğrenci kaydı (gerçek Firestore — profile.linkedStudentId) */}
        <MyRecord />

        <Reveal>
          <SectionHeader
            eyebrow="Öğrenci Merkezi"
            title="Öğrenci Merkezi"
            description="Programın, ödevlerin, notların ve duyuruların burada."
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
          <h2 className="mb-4 text-lg font-semibold text-content">Okul Yaşamı</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureLinkCard
              href="/lesson-plans"
              icon={NotebookPen}
              title="Ders Planları"
              description="Sınıfının ders planlarını görüntüle."
            />
            <FeatureLinkCard
              href="/events"
              icon={CalendarCheck}
              title="Etkinlikler"
              description="Okul etkinliklerini takip et."
            />
            <FeatureLinkCard
              href="/lunch-menu"
              icon={UtensilsCrossed}
              title="Yemek Listesi"
              description="Günlük yemek menüsünü gör."
            />
            <FeatureLinkCard
              href="/bus-routes"
              icon={Bus}
              title="Servis Takibi"
              description="Servis rotalarını ve saatlerini gör."
            />
          </div>
        </section>

        {/* Yakında gelecek öğrenci özellikleri — dürüst placeholder (sahte veri yok). */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">Yakında</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ComingSoonCard
              icon={Sparkles}
              title="AI Çalışma Koçu"
              description="Kişisel çalışma önerileri ve soru-cevap desteği burada olacak."
            />
            <ComingSoonCard
              icon={Trophy}
              title="Başarı Rozetleri"
              description="Çalışma serisi ve başarılarına göre kazandığın rozetler burada görünecek."
            />
            <ComingSoonCard
              icon={Target}
              title="Hedef Takibi"
              description="Akademik hedeflerini belirleyip ilerlemeni buradan izleyeceksin."
            />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
