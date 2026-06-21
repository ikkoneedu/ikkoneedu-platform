"use client";

import { useState, type FormEvent } from "react";
import { Settings2, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { platformSettings } from "@/lib/settings-mock-data";

const STORAGE_KEY = "ikkoneedu:platform-settings";

/**
 * Genel Platform Ayarları — işlevsel.
 * Ayarlar tarayıcıda (localStorage) kalıcı kaydedilir ve onay gösterilir.
 * (Platform genelinde kalıcılık için ileride Firestore platform/config'e
 * bağlanabilir.)
 */
export function PlatformSettings() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: String(f.get("name") ?? ""),
      fullName: String(f.get("fullName") ?? ""),
      slogan: String(f.get("slogan") ?? ""),
      language: String(f.get("language") ?? ""),
      theme: String(f.get("theme") ?? ""),
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* yoksay */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Settings2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Platform Bilgileri</h2>
        {saved && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 size={13} /> Kaydedildi
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Platform Adı" name="name" defaultValue={platformSettings.name} />
          <TextField label="Açılım" name="fullName" defaultValue={platformSettings.fullName} />
          <div className="sm:col-span-2">
            <TextField label="Slogan" name="slogan" defaultValue={platformSettings.slogan} />
          </div>
          <SelectField label="Varsayılan Dil" name="language" items={["Türkçe", "English"]} />
          <SelectField label="Varsayılan Tema" name="theme" items={["Dark Mode", "Light Mode"]} />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <span className="text-sm text-content">Sistem Durumu</span>
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {platformSettings.status}
          </span>
        </div>

        <PrimaryButton type="submit" size="lg" className="mt-6 w-full sm:w-fit">
          Ayarları Kaydet
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
