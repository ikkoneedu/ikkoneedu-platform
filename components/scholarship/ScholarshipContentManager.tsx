import { Layers, Clock } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { examContents } from "@/lib/scholarship-exam-mock-data";

/**
 * Sınav İçerik Bilgileri.
 * Kademe bazlı ders, soru sayısı ve süre kartları.
 */
export function ScholarshipContentManager() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Layers size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sınav İçerik Bilgileri</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {examContents.map((content) => {
          const totalQuestions = content.subjects.reduce(
            (sum, s) => sum + s.questionCount,
            0,
          );
          return (
            <div
              key={content.grade}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-content">{content.grade}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  <Clock size={13} aria-hidden="true" />
                  {content.duration}
                </span>
              </div>

              <ul className="space-y-2">
                {content.subjects.map((subject) => (
                  <li
                    key={subject.subject}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-sm"
                  >
                    <span className="text-content">{subject.subject}</span>
                    <span className="text-muted">{subject.questionCount} soru</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                <span className="text-muted">Toplam {totalQuestions} soru</span>
                <span className="font-medium text-accent">Puan ağırlığı: Eşit</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
