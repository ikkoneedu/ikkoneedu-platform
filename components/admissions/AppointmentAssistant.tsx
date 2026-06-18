import { CalendarPlus } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { AppointmentField } from "@/lib/admissions-ai-mock-data";

interface AppointmentAssistantProps {
  fields: AppointmentField[];
}

/**
 * Otomatik Randevu Yönlendirme — AI Randevu Asistanı (mock).
 */
export function AppointmentAssistant({ fields }: AppointmentAssistantProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <CalendarPlus size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Randevu Asistanı</h2>
      </div>

      <ul className="flex-1 space-y-3">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <li
              key={field.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                <Icon size={17} aria-hidden="true" />
              </span>
              <span className="flex-1 text-sm text-muted">{field.label}</span>
              <span className="text-sm font-medium text-content">{field.value}</span>
            </li>
          );
        })}
      </ul>

      <PrimaryButton size="md" className="mt-5 w-full">
        <CalendarPlus size={16} aria-hidden="true" />
        Randevuyu Onayla
      </PrimaryButton>
    </GlassCard>
  );
}
