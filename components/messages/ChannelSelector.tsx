"use client";

import { useState } from "react";
import { Radio } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { channels } from "@/lib/messages-mock-data";

/**
 * Kanal Seçimi — seçilebilir kanal kartları (mock).
 * channels verisini doğrudan içe aktarır (client bileşeni; ikon fonksiyonları
 * server sınırından geçirilemez).
 */
export function ChannelSelector() {
  const [activeId, setActiveId] = useState(channels[0]?.id);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2 text-content">
        <Radio size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Kanal Seçimi</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const active = channel.id === activeId;
          return (
            <button key={channel.id} type="button" onClick={() => setActiveId(channel.id)} className="text-left">
              <GlassCard
                tone="navy"
                interactive
                className={active ? "h-full border-accent/50 ring-1 ring-inset ring-accent/20" : "h-full"}
              >
                <span
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-xl border",
                    active ? "border-accent/30 bg-accent/15 text-accent" : "border-white/10 bg-navy/40 text-muted",
                  ].join(" ")}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-content">{channel.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{channel.description}</p>
              </GlassCard>
            </button>
          );
        })}
      </div>
    </section>
  );
}
