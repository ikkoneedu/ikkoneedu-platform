"use client";

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface ToneSelectorProps {
  /** Seçilebilir ton etiketleri (yalnızca string[] — server sınırından güvenle geçer). */
  tones: string[];
}

/**
 * Ton Seçimi — client bileşeni.
 * Seçilen ton chip'i vurgulanır (useState). Yalnızca string[] prop alır;
 * lucide ikon dizisi server→client sınırından geçirilmez.
 */
export function ToneSelector({ tones }: ToneSelectorProps) {
  const [activeTone, setActiveTone] = useState(tones[0]);

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Palette size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Yorum Tonu</h2>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-muted">
        Yorumun dilini ve uzunluğunu belirleyen tonu seçin.
      </p>

      <div className="flex flex-wrap gap-3">
        {tones.map((tone) => {
          const active = tone === activeTone;
          return (
            <button
              key={tone}
              type="button"
              onClick={() => setActiveTone(tone)}
              className={[
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "border-accent/50 bg-accent/15 text-accent ring-1 ring-inset ring-accent/20"
                  : "border-white/10 bg-navy/40 text-muted hover:border-accent/30 hover:text-content",
              ].join(" ")}
            >
              {active && <Check size={15} aria-hidden="true" />}
              {tone}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
