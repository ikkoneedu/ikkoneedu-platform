import { Siren } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import { Toggle } from "@/components/settings/Toggle";

interface EmergencyNotificationProps {
  recipientGroups: string[];
}

/**
 * Acil Bildirim Modu (mock).
 * Yüksek öncelikli, SMS destekli acil bildirim gönderimi.
 */
export function EmergencyNotification({ recipientGroups }: EmergencyNotificationProps) {
  return (
    <GlassCard className="border-brand/30 bg-brand/[0.06]">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand/30 bg-brand/15 text-brand">
          <Siren size={18} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-content">Acil Bildirim</h2>
        <span className="ml-auto rounded-full border border-brand/30 bg-brand/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
          Yüksek Öncelik
        </span>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-muted">
        Servis gecikmesi, okul kapanışı, güvenlik duyurusu veya acil
        bilgilendirmeler için yüksek öncelikli bildirim gönderimi.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Acil Başlık" name="emergency-title" placeholder="Acil bildirim başlığı" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-muted">Acil Mesaj</label>
          <textarea
            rows={3}
            placeholder="Acil mesajı yazın..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <SelectField label="Hedef Grup" items={recipientGroups} />
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <span className="text-sm text-content">SMS ile Destekle</span>
          <Toggle defaultOn label="SMS ile destekle" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-muted">
        <span className="h-2 w-2 rounded-full bg-brand" />
        Push önceliği: Yüksek
      </div>

      <PrimaryButton size="lg" className="mt-4 w-full bg-brand hover:bg-brand/90 sm:w-fit">
        <Siren size={18} aria-hidden="true" />
        Acil Bildirim Gönder
      </PrimaryButton>
    </GlassCard>
  );
}
