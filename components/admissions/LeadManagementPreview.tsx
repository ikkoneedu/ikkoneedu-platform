"use client";

import { useState, type FormEvent } from "react";
import { ContactRound, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import type { LeadField } from "@/lib/admissions-ai-mock-data";

interface LeadManagementPreviewProps {
  fields: LeadField[];
}

/**
 * Lead Yönetimi Hazırlığı — işlevsel.
 * Form doğrulanır ve aday kaydı tarayıcıda (localStorage) saklanır + onay.
 * (CRM'e canlı kayıt için /crm panelindeki gerçek lead formu kullanılır.)
 */
export function LeadManagementPreview({ fields }: LeadManagementPreviewProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const entries: Record<string, string> = {};
    let filled = 0;
    for (const [k, v] of f.entries()) {
      const val = String(v).trim();
      entries[k] = val;
      if (val) filled += 1;
    }
    if (filled === 0) {
      setError("Lütfen en az bir alan doldurun.");
      return;
    }
    setError(null);
    try {
      const list = JSON.parse(localStorage.getItem("ikkoneedu:lead-drafts") || "[]");
      list.unshift({ ...entries, createdAt: new Date().toISOString() });
      localStorage.setItem("ikkoneedu:lead-drafts", JSON.stringify(list.slice(0, 50)));
    } catch {
      /* yoksay */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    e.currentTarget.reset();
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <ContactRound size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Lead Yönetimi Hazırlığı</h2>
        {saved && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 size={13} /> Kaydedildi
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            if (field.type === "select") {
              return (
                <SelectField
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  items={field.options ?? []}
                />
              );
            }
            if (field.type === "textarea") {
              return (
                <div key={field.id} className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-muted">{field.label}</label>
                  <textarea
                    name={field.id}
                    rows={3}
                    placeholder="Görüşme notlarını yazın..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              );
            }
            return (
              <TextField
                key={field.id}
                label={field.label}
                name={field.id}
                type={field.type === "date" ? "date" : "text"}
              />
            );
          })}
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
            <AlertCircle size={15} aria-hidden="true" /> {error}
          </p>
        )}

        <PrimaryButton type="submit" size="lg" className="mt-6 w-full sm:w-fit">
          Lead Kaydet
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
