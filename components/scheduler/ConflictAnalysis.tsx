import { ShieldCheck, UserX, CalendarX, Sparkles, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ConflictAnalysis as ConflictData } from "@/lib/scheduler-mock-data";

interface ConflictAnalysisProps {
  data: ConflictData;
}

/**
 * AI Çakışma Kontrolü.
 * Öğretmen/sınıf çakışması, boşluk optimizasyonu ve uygunluk puanını gösterir.
 */
export function ConflictAnalysis({ data }: ConflictAnalysisProps) {
  const rows: { id: string; label: string; value: string; icon: LucideIcon; good: boolean }[] = [
    { id: "ogretmen", label: "Öğretmen çakışması", value: String(data.teacherConflict), icon: UserX, good: data.teacherConflict === 0 },
    { id: "sinif", label: "Sınıf çakışması", value: String(data.classConflict), icon: CalendarX, good: data.classConflict === 0 },
    { id: "bos", label: "Boş saat optimizasyonu", value: `%${data.gapOptimization}`, icon: Sparkles, good: true },
    { id: "uygunluk", label: "Program uygunluk puanı", value: `%${data.fitScore}`, icon: Award, good: true },
  ];

  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Çakışma Kontrolü</h2>
      </div>

      <ul className="space-y-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
            >
              <span
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                  row.good
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                    : "border-brand/20 bg-brand/10 text-brand",
                ].join(" ")}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="flex-1 text-sm text-content">{row.label}</span>
              <span className="text-sm font-bold text-content">{row.value}</span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
