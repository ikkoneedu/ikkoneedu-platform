"use client";

import { forwardRef } from "react";
import type { NetworkModule } from "@/components/landing/cinematic-modules";

interface ModuleNodeProps {
  module: NetworkModule;
}

/**
 * Tek bir modül düğümü — premium cam/holografik kart.
 * Konum/ölçek/opaklık üst sahne tarafından her karede imperatif (ref ile)
 * güncellenir; bu bileşen yalnızca görünümü sağlar.
 */
export const ModuleNode = forwardRef<HTMLDivElement, ModuleNodeProps>(
  function ModuleNode({ module }, ref) {
    const { Icon, label, tone } = module;
    const accent =
      tone === "red"
        ? "border-brand/40 text-brand shadow-[0_0_24px_-6px_rgba(214,40,57,0.55)]"
        : "border-accent/40 text-accent shadow-[0_0_24px_-6px_rgba(178,199,239,0.55)]";

    return (
      <div
        ref={ref}
        className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
        style={{ transform: "translate3d(-9999px,-9999px,0)" }}
      >
        <div
          className={`group flex items-center gap-2 rounded-2xl border bg-overlay/[0.04] px-3 py-2 backdrop-blur-md ${accent}`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
              tone === "red"
                ? "border-brand/30 bg-brand/10"
                : "border-accent/30 bg-accent/10"
            }`}
          >
            <Icon size={15} aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap text-xs font-semibold tracking-wide text-content">
            {label}
          </span>
        </div>
      </div>
    );
  },
);
