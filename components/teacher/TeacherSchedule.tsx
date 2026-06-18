import { Clock, Users, ClipboardCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { TeacherLesson } from "@/lib/mock-data";

interface TeacherScheduleProps {
  lessons: TeacherLesson[];
}

/**
 * Günlük ders programı.
 * Her ders için saat, sınıf, ders, mevcut ve yoklama al butonu gösterir.
 */
export function TeacherSchedule({ lessons }: TeacherScheduleProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {lessons.map((lesson) => (
        <GlassCard key={lesson.id} tone="navy" interactive className="flex flex-col p-5">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-accent">
            <Clock size={15} aria-hidden="true" />
            {lesson.time}
          </span>
          <h3 className="mt-3 text-base font-semibold text-content">
            {lesson.classGroup} {lesson.lesson}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Users size={13} aria-hidden="true" />
            {lesson.count} öğrenci
          </p>
          <PrimaryButton variant="secondary" size="sm" className="mt-4 w-full">
            <ClipboardCheck size={15} aria-hidden="true" />
            Yoklama Al
          </PrimaryButton>
        </GlassCard>
      ))}
    </div>
  );
}
