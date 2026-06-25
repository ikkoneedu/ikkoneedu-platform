import { ClipboardList } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SelectField } from "@/components/shared/SelectField";
import {
  achievementLevels,
  developmentAreas,
} from "@/lib/report-card-mock-data";

/**
 * Performans Bilgileri — server bileşeni.
 * Akademik başarı durumu (select), davranış/katılım gözlemi (textarea) ve
 * gelişim alanları (checkbox grubu) ile öğretmen girdilerini toplar.
 */
export function PerformanceForm() {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <ClipboardList size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">
          Performans Bilgileri
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <SelectField
          label="Akademik Başarı Durumu"
          items={achievementLevels.map((l) => l.label)}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="behavior-note"
            className="text-xs font-medium text-muted"
          >
            Davranış ve Katılım Gözlemi
          </label>
          <textarea
            id="behavior-note"
            name="behaviorNote"
            rows={4}
            placeholder="Öğrencinin derse katılımı, sorumluluk bilinci ve sınıf içi davranışlarına dair gözlemlerinizi yazın..."
            className="w-full resize-none rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-1 text-xs font-medium text-muted">
            Gelişim Alanları
          </legend>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {developmentAreas.map((area) => (
              <label
                key={area.id}
                htmlFor={area.id}
                className="flex items-center gap-2.5 rounded-xl border border-overlay/10 bg-navy/40 px-3 py-2.5 text-sm text-content transition-colors hover:border-accent/30"
              >
                <input
                  id={area.id}
                  type="checkbox"
                  name="developmentAreas"
                  value={area.label}
                  className="h-4 w-4 rounded border-overlay/20 bg-overlay/[0.04] accent-accent"
                />
                {area.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </GlassCard>
  );
}
