import type { Metadata } from "next";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Öğretmen Portalı — ${productName}`,
  description: "Sınıflarınızı, derslerinizi ve değerlendirmelerinizi yönetin.",
};

const lessons = [
  { id: "1", time: "09:00", lesson: "Matematik", group: "9-A" },
  { id: "2", time: "11:00", lesson: "Matematik", group: "10-B" },
  { id: "3", time: "13:00", lesson: "Geometri", group: "11-A" },
  { id: "4", time: "14:00", lesson: "Matematik", group: "9-C" },
];

const pending = [
  { id: "1", title: "9-A Deneme Sınavı", count: "28 kâğıt" },
  { id: "2", title: "10-B Proje Ödevi", count: "24 ödev" },
  { id: "3", title: "11-A Quiz", count: "26 kâğıt" },
];

export default function TeacherPage() {
  return (
    <PageShell title="Öğretmen Portalı">
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Öğretmen"
          title="Günaydın, Ayşe Öğretmen"
          description="Bugünkü dersleriniz ve bekleyen değerlendirmeleriniz hazır."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Sınıflarım" value="5" icon={BookOpen} />
          <StatCard label="Bugünkü Ders" value="4" icon={Clock} />
          <StatCard label="Bekleyen Değerlendirme" value="18" delta="+6" trend="down" icon={ClipboardCheck} />
          <StatCard label="Toplam Öğrenci" value="142" delta="+4" trend="up" icon={Users} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassCard tone="navy" className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-content">
              Bugünkü Dersler
            </h2>
            <ul className="space-y-3">
              {lessons.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium text-accent">
                    <Clock size={15} aria-hidden="true" />
                    {item.time}
                  </span>
                  <span className="flex-1 text-sm font-medium text-content">
                    {item.lesson}
                  </span>
                  <span className="rounded bg-navy/40 px-2 py-0.5 text-xs text-muted">
                    {item.group}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <div className="flex flex-col gap-6">
            <GlassCard tone="navy">
              <h2 className="mb-4 text-lg font-semibold text-content">
                Bekleyen Değerlendirmeler
              </h2>
              <ul className="space-y-3">
                {pending.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-content">{item.title}</span>
                    <span className="shrink-0 text-xs text-muted">{item.count}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="ai-gradient border-accent/20">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles size={18} aria-hidden="true" />
                <span className="text-sm font-semibold">AI Sınav Oluşturucu</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Kazanımlara uygun sınavı saniyeler içinde hazırlayın.
              </p>
              <PrimaryButton size="sm" className="mt-4 w-full">
                Sınav Oluştur
                <ArrowRight size={16} aria-hidden="true" />
              </PrimaryButton>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
