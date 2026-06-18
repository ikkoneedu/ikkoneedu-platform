import { LayoutTemplate } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { MessageTemplate } from "@/lib/messages-mock-data";

interface MessageTemplatesProps {
  templates: MessageTemplate[];
}

/**
 * Mesaj Şablonları.
 */
export function MessageTemplates({ templates }: MessageTemplatesProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2 text-content">
        <LayoutTemplate size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Mesaj Şablonları</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <GlassCard key={template.id} tone="navy" interactive className="flex flex-col">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-content">{template.name}</h3>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">{template.purpose}</p>
              <PrimaryButton variant="secondary" size="sm" className="mt-4 w-full">
                Kullan
              </PrimaryButton>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
