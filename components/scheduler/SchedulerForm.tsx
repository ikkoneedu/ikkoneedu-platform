import { SlidersHorizontal, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { SchedulerFormOptions } from "@/lib/scheduler-mock-data";

interface SchedulerFormProps {
  options: SchedulerFormOptions;
}

interface SelectFieldProps {
  label: string;
  items: string[];
}

function SelectField({ label, items }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      <select
        aria-label={label}
        defaultValue={items[0]}
        className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      >
        {items.map((item) => (
          <option key={item} className="bg-surface text-content">
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Program oluşturma formu.
 * Kampüs, kademe, sınıf, ders saati, öğretmen, ders ve öncelik kuralı seçimi.
 * "AI ile Program Oluştur" butonu şimdilik mock'tur.
 */
export function SchedulerForm({ options }: SchedulerFormProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Program Oluşturma</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Kampüs" items={options.campuses} />
        <SelectField label="Kademe" items={options.levels} />
        <SelectField label="Sınıf" items={options.classes} />
        <SelectField label="Haftalık Ders Saati" items={options.weeklyHours} />
        <SelectField label="Öğretmen" items={options.teachers} />
        <SelectField label="Ders" items={options.lessons} />
      </div>

      <div className="mt-4">
        <SelectField label="Öncelik Kuralı" items={options.priorityRules} />
      </div>

      <PrimaryButton size="lg" className="mt-6 w-full">
        <Sparkles size={18} aria-hidden="true" />
        AI ile Program Oluştur
      </PrimaryButton>
    </GlassCard>
  );
}
