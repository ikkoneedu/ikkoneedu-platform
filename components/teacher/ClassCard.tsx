import { Users, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { TeacherClass } from "@/lib/mock-data";

interface ClassCardProps {
  classItem: TeacherClass;
}

/**
 * Sınıf kartı.
 * Öğrenci sayısı, başarı ortalaması, son etkinlik ve "sınıfı aç" eylemi.
 */
export function ClassCard({ classItem }: ClassCardProps) {
  return (
    <GlassCard tone="navy" interactive className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-lg font-bold text-accent">
          {classItem.name}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted">
          <Users size={13} aria-hidden="true" />
          {classItem.students} öğrenci
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted">
            <TrendingUp size={14} aria-hidden="true" />
            Başarı Ortalaması
          </span>
          <span className="font-semibold text-content">{classItem.average}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted">
            <Activity size={14} aria-hidden="true" />
            Son Etkinlik
          </span>
          <span className="text-content">{classItem.lastActivity}</span>
        </div>
      </div>

      <PrimaryButton variant="secondary" size="sm" className="mt-5 w-full">
        Sınıfı Aç
        <ArrowRight size={15} aria-hidden="true" />
      </PrimaryButton>
    </GlassCard>
  );
}
