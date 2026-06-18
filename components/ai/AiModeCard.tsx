import { GlassCard } from "@/components/shared/GlassCard";
import type { AiMode } from "@/lib/ai-mock-data";

interface AiModeCardProps {
  mode: AiMode;
}

/**
 * Rol bazlı AI modu kartı.
 * Her kullanıcı rolü için AI Brain'in sağladığı desteği özetler.
 */
export function AiModeCard({ mode }: AiModeCardProps) {
  const Icon = mode.icon;
  return (
    <GlassCard interactive className="flex items-start gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-content">{mode.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {mode.description}
        </p>
      </div>
    </GlassCard>
  );
}
