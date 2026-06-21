import { Sparkles } from "lucide-react";

/**
 * AI modüllerinin bu sürümde dondurulduğunu net biçimde belirten şerit.
 * Aşağıdaki ekranlar tasarım/önizleme amaçlıdır; gerçek AI üretimi (OpenAI/
 * Claude/Gemini) bağlanınca aktifleşecektir.
 */
export function AiComingSoonNotice() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-navy/50 text-accent">
        <Sparkles size={18} aria-hidden="true" />
      </span>
      <div className="text-sm">
        <p className="font-semibold text-content">
          Yapay Zeka — Yakında
          <span className="ml-2 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
            Coming Soon
          </span>
        </p>
        <p className="mt-0.5 text-muted">
          Bu modüldeki AI üretimi henüz bağlı değildir. Ekranlar tasarım/önizleme
          amaçlıdır; gerçek operasyonel modüller (CRM, bursluluk, program, finans
          vb.) tam çalışır durumdadır.
        </p>
      </div>
    </div>
  );
}
