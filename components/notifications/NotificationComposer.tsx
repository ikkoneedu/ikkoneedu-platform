import { BellPlus } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";

interface NotificationComposerProps {
  options: {
    recipientGroups: string[];
    types: string[];
    channels: string[];
    schedule: string[];
  };
}

/**
 * Bildirim Oluşturucu (mock form).
 * Gerçek gönderim yoktur.
 */
export function NotificationComposer({ options }: NotificationComposerProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <BellPlus size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bildirim Oluşturucu</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Bildirim Başlığı" name="title" placeholder="Bildirim başlığı" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-muted">Bildirim Metni</label>
          <textarea
            rows={4}
            placeholder="Bildirim metnini yazın..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <SelectField label="Alıcı Grubu" items={options.recipientGroups} />
        <SelectField label="Bildirim Türü" items={options.types} />
        <SelectField label="Kanal" items={options.channels} />
        <SelectField label="Gönderim Zamanı" items={options.schedule} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <PrimaryButton variant="secondary" size="md">Taslak Kaydet</PrimaryButton>
        <PrimaryButton variant="secondary" size="md">Önizle</PrimaryButton>
        <PrimaryButton size="md">Bildirim Gönder</PrimaryButton>
      </div>
    </GlassCard>
  );
}
