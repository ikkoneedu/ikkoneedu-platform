import { PenSquare } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";

interface MessageComposerProps {
  options: {
    recipientGroups: string[];
    classes: string[];
    channels: string[];
    schedule: string[];
  };
}

/**
 * Mesaj Oluşturucu (mock form).
 * Gerçek gönderim yoktur.
 */
export function MessageComposer({ options }: MessageComposerProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <PenSquare size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Mesaj Oluşturucu</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Alıcı Grubu" items={options.recipientGroups} />
        <SelectField label="Sınıf / Kademe" items={options.classes} />
        <SelectField label="Kanal" items={options.channels} />
        <SelectField label="Gönderim Zamanı" items={options.schedule} />
        <div className="sm:col-span-2">
          <TextField label="Başlık" name="title" placeholder="Mesaj başlığı" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-muted">Mesaj İçeriği</label>
          <textarea
            rows={5}
            placeholder="Mesajınızı yazın..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <PrimaryButton variant="secondary" size="md">Taslak Kaydet</PrimaryButton>
        <PrimaryButton variant="secondary" size="md">Önizle</PrimaryButton>
        <PrimaryButton size="md">Gönder</PrimaryButton>
      </div>
    </GlassCard>
  );
}
