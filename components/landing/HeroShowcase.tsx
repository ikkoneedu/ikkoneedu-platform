"use client";

import { motion } from "framer-motion";
import { Bot, Smartphone, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { heroMetrics } from "@/lib/mock-data";

const float = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

/**
 * Hero bölümü premium dashboard mockup kümesi.
 * AI Brain kartı, mobil uygulama önizlemesi ve canlı metrik kartlarını
 * hafif yüzen animasyonla sergiler.
 */
export function HeroShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Arka ışıma */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-accent/10 blur-3xl" />

      <div className="grid grid-cols-2 gap-4">
        {/* AI Brain kartı */}
        <motion.div {...float} className="col-span-2">
          <GlassCard tone="navy" className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
              <Bot size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                AI Brain
              </p>
              <p className="text-sm text-content">
                Bu hafta okul performansında{" "}
                <span className="font-semibold text-accent">%5 artış</span>{" "}
                öngörülüyor.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Mobil uygulama önizlemesi */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <GlassCard className="h-full">
            <div className="mb-3 flex items-center gap-2 text-muted">
              <Smartphone size={16} aria-hidden="true" />
              <span className="text-xs font-medium">Mobil Uygulama</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-3/4 rounded-full bg-white/10" />
              <div className="h-2 w-full rounded-full bg-white/[0.06]" />
              <div className="h-2 w-2/3 rounded-full bg-white/[0.06]" />
              <div className="mt-3 h-8 rounded-lg bg-accent/20" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Canlı metrik kartları */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="space-y-4"
        >
          <GlassCard tone="navy" className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{heroMetrics[0].label}</span>
              <TrendingUp size={14} className="text-emerald-400" aria-hidden="true" />
            </div>
            <p className="mt-1 text-2xl font-bold text-content">
              {heroMetrics[0].value}
            </p>
          </GlassCard>
          <GlassCard tone="navy" className="p-4">
            <span className="text-xs text-muted">{heroMetrics[1].label}</span>
            <p className="mt-1 text-2xl font-bold text-content">
              {heroMetrics[1].value}
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
