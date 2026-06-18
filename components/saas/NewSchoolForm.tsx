import { PlusCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";

interface NewSchoolFormProps {
  plans: string[];
}

/**
 * Yeni Okul Ekle formu.
 * Okul oluşturma alanları + paket seçimi; buton şimdilik mock'tur.
 */
export function NewSchoolForm({ plans }: NewSchoolFormProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <PlusCircle size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Yeni Okul Ekle</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Okul Adı" name="school" placeholder="Örnek Koleji" />
        <TextField label="Yetkili Adı" name="manager" placeholder="Ad Soyad" />
        <TextField label="Telefon" name="phone" type="tel" placeholder="0 5xx xxx xx xx" />
        <TextField label="E-posta" name="email" type="email" placeholder="ornek@okul.com" />
        <TextField label="Öğrenci Sayısı" name="students" type="number" placeholder="500" />
        <SelectField label="Paket Türü" items={plans} />
      </div>

      <PrimaryButton size="lg" className="mt-6 w-full sm:w-fit">
        <PlusCircle size={18} aria-hidden="true" />
        Okul Oluştur
      </PrimaryButton>
    </GlassCard>
  );
}
