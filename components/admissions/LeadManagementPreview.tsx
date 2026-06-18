import { ContactRound } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import type { LeadField } from "@/lib/admissions-ai-mock-data";

interface LeadManagementPreviewProps {
  fields: LeadField[];
}

/**
 * CRM Hazırlığı — Lead Yönetimi Hazırlığı (mock form).
 * Gerçek CRM bağlantısı yoktur.
 */
export function LeadManagementPreview({ fields }: LeadManagementPreviewProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <ContactRound size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Lead Yönetimi Hazırlığı</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          if (field.type === "select") {
            return <SelectField key={field.id} label={field.label} items={field.options ?? []} />;
          }
          if (field.type === "textarea") {
            return (
              <div key={field.id} className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-muted">{field.label}</label>
                <textarea
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

      <PrimaryButton size="lg" className="mt-6 w-full sm:w-fit">
        Lead Kaydet
      </PrimaryButton>
    </GlassCard>
  );
}
