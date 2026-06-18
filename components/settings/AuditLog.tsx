import { History, CheckCircle2, Info } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { AuditEntry } from "@/lib/settings-mock-data";

interface AuditLogProps {
  entries: AuditEntry[];
}

/**
 * Audit Log / İşlem Geçmişi.
 * İşlem, kullanıcı, tarih ve durum bilgisini listeler (mock).
 */
export function AuditLog({ entries }: AuditLogProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <History size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">İşlem Geçmişi</h2>
      </div>

      <ul className="divide-y divide-white/5">
        {entries.map((entry) => {
          const ok = entry.status === "Başarılı";
          const Icon = ok ? CheckCircle2 : Info;
          return (
            <li key={entry.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  ok ? "bg-emerald-400/10 text-emerald-400" : "bg-accent/10 text-accent",
                ].join(" ")}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-content">{entry.action}</p>
                <p className="mt-0.5 text-xs text-muted">{entry.user}</p>
              </div>
              <span className="shrink-0 text-xs text-muted">{entry.date}</span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
