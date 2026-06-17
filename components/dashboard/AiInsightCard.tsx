import type { ReactNode } from "react";
import { Bot, ArrowRight } from "lucide-react";

interface AiInsightCardProps {
  /** Üstte gösterilen küçük etiket. */
  eyebrow: string;
  /** Öngörü metni (vurgular için zengin içerik desteklenir). */
  children: ReactNode;
  /** Detay bağlantısı metni. */
  actionLabel?: string;
}

/**
 * Yapay zeka öngörü kartı.
 * Degrade zemin, parıltı efekti ve robot ikonuyla AI çıktısını öne çıkarır.
 */
export function AiInsightCard({
  eyebrow,
  children,
  actionLabel = "Detayları Gör",
}: AiInsightCardProps) {
  return (
    <div className="ai-gradient relative flex items-start gap-4 overflow-hidden rounded-2xl border border-accent/20 p-6 shadow-[0_0_30px_rgba(178,199,239,0.05)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/20 text-accent">
        <Bot size={24} aria-hidden="true" />
      </div>

      <div className="relative">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </h3>
        <p className="text-lg font-medium leading-snug text-content sm:text-xl">
          {children}
        </p>

        <button
          type="button"
          className="mt-4 flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-content"
        >
          {actionLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
