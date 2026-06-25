"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  GraduationCap,
  Award,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  getSettings,
  saveSettings,
  SETTINGS_DEFAULTS,
  type SettingsSection,
  type SettingsShape,
} from "@/lib/services/settings";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

type FieldType = "text" | "date" | "time" | "color" | "email" | "url";
interface Field {
  key: string;
  label: string;
  type?: FieldType;
}

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.SUPER_ADMIN,
];

const SECTIONS: {
  id: SettingsSection;
  title: string;
  icon: typeof Building2;
  fields: Field[];
}[] = [
  {
    id: "school",
    title: "Okul Bilgileri",
    icon: Building2,
    fields: [
      { key: "name", label: "Okul Adı" },
      { key: "logoUrl", label: "Logo URL", type: "url" },
      { key: "primaryColor", label: "Kurumsal Renk", type: "color" },
      { key: "accentColor", label: "Vurgu Rengi", type: "color" },
      { key: "phone", label: "Telefon" },
      { key: "email", label: "E-posta", type: "email" },
      { key: "address", label: "Adres" },
      { key: "website", label: "Web Sitesi", type: "url" },
    ],
  },
  {
    id: "academic",
    title: "Akademik Ayarlar",
    icon: GraduationCap,
    fields: [
      { key: "academicYear", label: "Eğitim Yılı" },
      { key: "term", label: "Dönem" },
      { key: "gradeLevels", label: "Sınıf Seviyeleri (ör. 1-12)" },
    ],
  },
  {
    id: "scholarship",
    title: "Bursluluk Ayarları",
    icon: Award,
    fields: [
      { key: "examDate", label: "Sınav Tarihi", type: "date" },
      { key: "applicationDeadline", label: "Son Başvuru", type: "date" },
      { key: "quota", label: "Kontenjan" },
      { key: "applicationPrefix", label: "Başvuru No Ön Eki (ör. IKK)" },
    ],
  },
  {
    id: "timetable",
    title: "Ders Programı Ayarları",
    icon: Clock,
    fields: [
      { key: "lessonStart", label: "İlk Ders Saati", type: "time" },
      { key: "lessonDuration", label: "Ders Süresi (dk)" },
      { key: "breakDuration", label: "Teneffüs (dk)" },
      { key: "days", label: "Gün Yapısı" },
    ],
  },
];

/**
 * Canlı Okul Ayarları — `tenants/{tenantId}/settings/{section}` üzerinden GERÇEK
 * okuma/yazma. Tüm modüllerin tek ayar kaynağı. Yalnızca okul personeli yazabilir
 * (Firestore kuralları zorlar).
 */
export function LiveSettings() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canEdit =
    profile != null && MANAGER_ROLES.includes(profile.role);

  const usable = firebaseReady && Boolean(tenantId);
  const [values, setValues] = useState<SettingsShape>(SETTINGS_DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [savingSection, setSavingSection] = useState<SettingsSection | null>(null);
  const [savedSection, setSavedSection] = useState<SettingsSection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) return;
    const [school, academic, scholarship, timetable] = await Promise.all([
      getSettings(tenantId, "school"),
      getSettings(tenantId, "academic"),
      getSettings(tenantId, "scholarship"),
      getSettings(tenantId, "timetable"),
    ]);
    setValues({ school, academic, scholarship, timetable });
    setLoaded(true);
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="text-sm text-muted">
          <p className="font-semibold text-content">Canlı ayarlar kullanılamıyor</p>
          <p className="mt-1">
            Ayarların Firestore’a kaydedilebilmesi için giriş yapmış bir okul
            hesabı ve aktif Firebase yapılandırması gerekir.
          </p>
        </div>
      </GlassCard>
    );
  }

  const setField = (section: SettingsSection, key: string, value: string) => {
    setValues((v) => ({ ...v, [section]: { ...v[section], [key]: value } }));
  };

  const save = async (section: SettingsSection) => {
    if (!tenantId || savingSection) return;
    setSavingSection(section);
    setError(null);
    try {
      await saveSettings(tenantId, section, values[section]);
      setSavedSection(section);
      setTimeout(() => setSavedSection((s) => (s === section ? null : s)), 2500);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const data = values[section.id] as unknown as Record<string, string>;
        return (
          <GlassCard key={section.id} tone="navy">
            <div className="mb-4 flex items-center gap-2">
              <Icon size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-content">{section.title}</h2>
              {savedSection === section.id && (
                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 size={13} /> Kaydedildi
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">{field.label}</label>
                  {field.type === "color" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={data[field.key] || "#0A2342"}
                        disabled={!canEdit}
                        onChange={(e) => setField(section.id, field.key, e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-overlay/10 bg-transparent disabled:opacity-50"
                      />
                      <span className="font-mono text-xs text-muted">{data[field.key]}</span>
                    </div>
                  ) : (
                    <input
                      type={
                        field.type === "date"
                          ? "date"
                          : field.type === "time"
                            ? "time"
                            : field.type === "email"
                              ? "email"
                              : field.type === "url"
                                ? "url"
                                : "text"
                      }
                      value={data[field.key] ?? ""}
                      disabled={!canEdit}
                      onChange={(e) => setField(section.id, field.key, e.target.value)}
                      className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60"
                    />
                  )}
                </div>
              ))}
            </div>

            {canEdit && (
              <PrimaryButton
                size="md"
                className="mt-5"
                onClick={() => save(section.id)}
                disabled={!loaded || savingSection === section.id}
              >
                <Save size={16} aria-hidden="true" />
                {savingSection === section.id ? "Kaydediliyor…" : "Kaydet"}
              </PrimaryButton>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}
