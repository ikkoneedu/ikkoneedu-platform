import { PencilLine } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SelectField } from "@/components/shared/SelectField";
import { TextField } from "@/components/shared/TextField";
import { examBuilderOptions } from "@/lib/scholarship-exam-mock-data";

/**
 * Sınav Oluşturucu.
 * Bursluluk sınavının temel ayarlarını tanımlayan (mock) form.
 */
export function ScholarshipExamBuilder() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <PencilLine size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sınav Oluşturucu</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Sınav Adı" name="examName" placeholder="2027 Bursluluk ve Kabul Sınavı" />
        <SelectField label="Okul / Kampüs" items={examBuilderOptions.campuses} />
        <SelectField label="Sınav Türü" items={examBuilderOptions.modes} />
        <SelectField label="Başvuru Durumu" items={examBuilderOptions.statuses} />
        <TextField label="Başvuru Başlangıç" name="applyStart" type="date" />
        <TextField label="Başvuru Bitiş" name="applyEnd" type="date" />
        <TextField label="Sınav Tarihi" name="examDate" type="date" />
        <TextField label="Sınav Saati" name="examTime" type="time" />
        <TextField label="Sonuç Açıklama Tarihi" name="resultDate" type="date" />
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-medium text-muted">Kademeler</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {examBuilderOptions.gradeLevels.map((grade) => (
            <label
              key={grade}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content"
            >
              <input
                type="checkbox"
                name="gradeLevels"
                value={grade}
                className="size-4 accent-accent"
              />
              {grade}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <TextField label="Toplam Kontenjan" name="quota" type="number" placeholder="2000" />
        <TextField label="Kampüs Sayısı" name="campusCount" type="number" placeholder="3" />
        <TextField label="Oturum Sayısı" name="sessionCount" type="number" placeholder="6" />
        <TextField label="Salon Kapasitesi" name="roomCapacity" type="number" placeholder="30" />
      </div>

      <div className="mt-6">
        <PrimaryButton type="button" disabled title="Yakında">
          Sınavı Oluştur · Yakında
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}
