import { Bot, Send } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/landing/Reveal";
import { PhoneMockup } from "@/components/mobile/PhoneMockup";
import { aiBrainExamples } from "@/lib/mobile-mock-data";

/** Telefon içinde gösterilen mobil AI sohbet taklidi. */
function ChatScreen() {
  return (
    <div className="flex h-full flex-col px-3 pb-3">
      <div className="flex items-center gap-2 border-b border-overlay/10 pb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent">
          <Bot size={15} aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold text-content">AI Brain</span>
      </div>

      <div className="mt-3 flex-1 space-y-2.5">
        <div className="flex justify-end">
          <span className="max-w-[85%] rounded-2xl bg-accent px-3 py-2 text-[11px] leading-tight text-navy">
            Yarınki etkinlikler neler?
          </span>
        </div>
        <div className="flex justify-start">
          <span className="max-w-[85%] rounded-2xl border border-overlay/10 bg-overlay/[0.05] px-3 py-2 text-[11px] leading-tight text-content">
            Yarın Bilim Fuarı (10:00) ve İngilizce Drama Gösterisi (14:00) var.
          </span>
        </div>
        <div className="flex justify-end">
          <span className="max-w-[85%] rounded-2xl bg-accent px-3 py-2 text-[11px] leading-tight text-navy">
            Bugünkü yemek listesi nedir?
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.05] px-3 py-2">
        <span className="flex-1 text-[10px] text-muted">Bir şey sorun...</span>
        <Send size={13} className="text-accent" aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * AI Brain Mobil — büyük premium kart.
 * Mobil yapay zeka sohbetini ve örnek komutları sergiler.
 */
export function AIBrainMobile() {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <GlassCard className="ai-gradient border-accent/20 px-6 py-10 sm:px-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-accent">
                <Bot size={20} aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  AI Brain Mobil
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-content sm:text-3xl">
                AI Brain Her Yerde
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                Okulunuzun yapay zeka beyni cebinizde. Tek bir mesajla bilgiye
                ulaşın, içerik üretin.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {aiBrainExamples.map((example) => (
                  <span
                    key={example}
                    className="rounded-full border border-overlay/10 bg-overlay/[0.05] px-3 py-1.5 text-xs font-medium text-content"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>

            <Reveal delay={0.1}>
              <PhoneMockup>
                <ChatScreen />
              </PhoneMockup>
            </Reveal>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
