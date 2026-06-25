import { ArrowUpRight } from "lucide-react";
import type { AiQuickPrompt } from "@/lib/ai-mock-data";

interface QuickPromptGridProps {
  prompts: AiQuickPrompt[];
}

/**
 * Hızlı komutlar ızgarası.
 * AI Brain'e tek tıkla gönderilebilecek hazır komutları sunar (mock).
 */
export function QuickPromptGrid({ prompts }: QuickPromptGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => {
        const Icon = prompt.icon;
        return (
          <button
            key={prompt.id}
            type="button"
            disabled
            title="Yakında (AI)"
            className="group flex cursor-not-allowed items-center gap-3 rounded-2xl border border-overlay/10 bg-overlay/[0.04] p-4 text-left opacity-60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
              <Icon size={20} aria-hidden="true" />
            </span>
            <span className="flex-1 text-sm font-medium text-content">
              {prompt.label}
            </span>
            <ArrowUpRight
              size={16}
              className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
