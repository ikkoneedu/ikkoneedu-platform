import Link from "next/link";
import { BellRing, Check, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

interface NotificationReadinessProps {
  items: string[];
}

/**
 * Bildirim Merkezi — Push Notification Hazırlığı (bilgi kartı).
 * Gerçek FCM entegrasyonu yoktur; yol haritası niteliğindedir.
 */
export function NotificationReadiness({ items }: NotificationReadinessProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <BellRing size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Push Notification Hazırlığı</h2>
      </div>
      <p className="mb-4 text-sm text-muted">
        Firebase Cloud Messaging entegrasyonu için planlanan adımlar:
      </p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-content">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent/15 text-accent">
              <Check size={12} aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <Link href="/notifications" className="mt-5 block">
        <PrimaryButton variant="secondary" size="sm" className="w-full">
          Bildirim Merkezi&apos;ni Aç
          <ArrowRight size={15} aria-hidden="true" />
        </PrimaryButton>
      </Link>
    </GlassCard>
  );
}

