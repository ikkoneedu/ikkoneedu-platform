import { Settings2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { platformSettings } from "@/lib/settings-mock-data";

/**
 * Genel Platform Ayarları — Platform Bilgileri.
 * Ad, açılım, slogan, dil, tema ve durum (mock kaydetme).
 */
export function PlatformSettings() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Settings2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Platform Bilgileri</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Platform Adı" name="name" defaultValue={platformSettings.name} />
        <TextField label="Açılım" name="fullName" defaultValue={platformSettings.fullName} />
        <div className="sm:col-span-2">
          <TextField label="Slogan" name="slogan" defaultValue={platformSettings.slogan} />
        </div>
        <SelectField label="Varsayılan Dil" items={["Türkçe", "English"]} />
        <SelectField label="Varsayılan Tema" items={["Dark Mode", "Light Mode"]} />
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
        <span className="text-sm text-content">Sistem Durumu</span>
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {platformSettings.status}
        </span>
      </div>

      <PrimaryButton size="lg" className="mt-6 w-full sm:w-fit">
        Ayarları Kaydet
      </PrimaryButton>
    </GlassCard>
  );
}
