import { MoreHorizontal } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { AdminActivity } from "@/lib/mock-data";

interface ActivityFeedProps {
  title: string;
  items: AdminActivity[];
}

/**
 * Son aktiviteler akışı.
 * Dikey zaman çizelgesi üzerinde ikon, başlık, açıklama ve zaman gösterir.
 * Yapay zeka kaynaklı aktiviteler aksan rengiyle vurgulanır.
 */
export function ActivityFeed({ title, items }: ActivityFeedProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-content">{title}</h2>
        <button
          type="button"
          aria-label="Daha fazla"
          className="text-muted transition-colors hover:text-accent"
        >
          <MoreHorizontal size={20} aria-hidden="true" />
        </button>
      </div>

      <ul className="flex-1 space-y-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;

          return (
            <li key={item.id} className="flex items-start gap-4">
              <span
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                  item.highlight
                    ? "border-accent/30 bg-accent/10 text-accent shadow-[0_0_10px_rgba(178,199,239,0.2)]"
                    : "border-white/10 bg-white/[0.04] text-muted",
                ].join(" ")}
              >
                <Icon size={18} aria-hidden="true" />
              </span>

              <div
                className={[
                  "flex-1",
                  isLast ? "" : "border-b border-white/5 pb-4",
                ].join(" ")}
              >
                <p className="text-sm font-medium text-content">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                <span className="mt-2 block text-xs text-muted/70">
                  {item.time}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <PrimaryButton variant="secondary" size="md" className="mt-4 w-full">
        Tümünü Gör
      </PrimaryButton>
    </GlassCard>
  );
}
