import { GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SelectField } from "@/components/shared/SelectField";
import {
  students,
  classes,
  subjects,
} from "@/lib/report-card-mock-data";

/**
 * Öğrenci Seçimi — server bileşeni.
 * Öğrenci, sınıf ve ders seçimi için mock verilerden beslenen SelectField'lar.
 */
export function StudentSelector() {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <GraduationCap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Öğrenci Seçimi</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Öğrenci"
          items={students.map((s) => s.name)}
          className="sm:col-span-2"
        />
        <SelectField label="Sınıf" items={classes.map((c) => c.name)} />
        <SelectField label="Ders" items={subjects.map((s) => s.name)} />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Karne yorumu, seçilen öğrencinin sınıf ve ders performansına göre
        kişiselleştirilir.
      </p>
    </GlassCard>
  );
}
