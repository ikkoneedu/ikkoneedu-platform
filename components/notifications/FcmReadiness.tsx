import { Flame, Database, GitBranch } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface FcmReadinessProps {
  collections: string[];
  flow: string[];
}

/**
 * Firebase Cloud Messaging Hazırlığı (bilgi kartı).
 * Gerçek FCM entegrasyonu yoktur; mimari ve iş akışını belgeler.
 */
export function FcmReadiness({ collections, flow }: FcmReadinessProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-2 flex items-center gap-2">
        <Flame size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Firebase Cloud Messaging Hazırlığı</h2>
      </div>
      <p className="mb-6 text-sm leading-relaxed text-muted">
        Gerçek bildirim sistemi için Firebase Auth, Firestore ve Firebase Cloud
        Messaging birlikte kullanılacaktır.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Teknik yapı */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-content">
            <Database size={15} className="text-accent" aria-hidden="true" />
            Teknik Yapı
          </div>
          <ul className="space-y-2">
            {collections.map((path) => (
              <li
                key={path}
                className="rounded-lg border border-white/5 bg-background/40 px-3 py-2 font-mono text-xs text-muted"
              >
                {path}
              </li>
            ))}
          </ul>
        </div>

        {/* İş akışı */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-content">
            <GitBranch size={15} className="text-accent" aria-hidden="true" />
            İş Akışı
          </div>
          <ol className="space-y-2">
            {flow.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5 text-sm text-content">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/15 text-[10px] font-bold text-accent">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </GlassCard>
  );
}
