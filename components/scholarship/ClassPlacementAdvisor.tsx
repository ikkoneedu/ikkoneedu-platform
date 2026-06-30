import { Sparkles, AlertTriangle, GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { PreviewBadge } from "@/components/shared/PreviewBadge";
import { placementSuggestion } from "@/lib/scholarship-exam-mock-data";

/**
 * Otomatik Sınıf / Kademe Yerleştirme.
 * Doğum tarihi ve mevcut sınıfa göre önerilen sınav (mock).
 */
export function ClassPlacementAdvisor() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <GraduationCap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">
          Otomatik Sınıf / Kademe Yerleştirme
        </h2>
        <PreviewBadge ai className="ml-auto" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Doğum Tarihi"
          name="birthDate"
          type="date"
          defaultValue="2017-05-12"
        />
        <TextField
          label="Mevcut Sınıf"
          name="currentGrade"
          placeholder="4. Sınıf"
          defaultValue={placementSuggestion.currentGrade}
        />
      </div>

      <div className="mt-4">
        <PrimaryButton type="button" variant="secondary" disabled title="Yakında">
          Öneri Hesapla · Yakında
        </PrimaryButton>
      </div>

      <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/[0.06] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">
          Önerilen Sınav
        </p>
        <p className="mt-1 text-lg font-semibold text-content">
          {placementSuggestion.suggestedExam}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {placementSuggestion.warnings.map((warning) => (
          <li
            key={warning}
            className="flex items-start gap-2 rounded-xl bg-amber-400/[0.08] px-3 py-2 text-sm text-amber-300"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{warning}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <Sparkles size={13} className="text-accent" aria-hidden="true" />
        Yapay zeka destekli kademe önerisi
      </p>
    </GlassCard>
  );
}
