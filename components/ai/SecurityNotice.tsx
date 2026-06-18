import { ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SecurityFeature } from "@/lib/ai-mock-data";

interface SecurityNoticeProps {
  features: SecurityFeature[];
}

/**
 * Güvenli AI Altyapısı bilgilendirme kartı.
 * Rol bazlı erişim ve KVKK uyumu gibi güvenlik özelliklerini listeler.
 */
export function SecurityNotice({ features }: SecurityNoticeProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Güvenli AI Altyapısı</h2>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted">
        AI Brain, kullanıcı rolüne göre yanıt üretir. Veli, öğrenci, öğretmen ve
        yönetici farklı bilgi seviyelerine erişir.
      </p>

      <ul className="space-y-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.id} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="text-sm text-content">{feature.label}</span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
