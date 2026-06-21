"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Network } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

interface HeroOverlayProps {
  visible: boolean;
  /** CTA hover/focus — çekirdekte nabız tetikler. */
  onCorePulse: () => void;
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const TRUST = [
  "Multi-tenant SaaS",
  "Built for Private Schools",
  "Founder School: İngiliz Kültür Kolejleri",
];

/**
 * Sinematik hero ön katmanı — açılış tamamlanınca yumuşakça belirir.
 * Metin solda/ortada; CTA ve güven göstergeleri altında.
 */
export function HeroOverlay({ visible, onCorePulse }: HeroOverlayProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={visible ? "show" : "hidden"}
      className="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-6xl flex-col items-center justify-center px-5 text-center sm:px-6 lg:items-start lg:text-left"
    >
      <motion.span
        variants={item}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-accent backdrop-blur-md"
      >
        <Network size={13} aria-hidden="true" />
        One Network Education Operating System
      </motion.span>

      <motion.h1
        variants={item}
        className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-content sm:text-6xl lg:text-7xl"
      >
        <span className="text-glow">IKK ONE EDU OS</span>
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-5 bg-gradient-to-r from-accent via-content to-accent bg-clip-text text-xl font-semibold text-transparent sm:text-2xl"
      >
        One Network. One Platform. One Future.
      </motion.p>

      <motion.p
        variants={item}
        className="mt-3 text-base font-medium text-muted sm:text-lg"
      >
        The Operating System for Modern Education.
      </motion.p>

      <motion.p
        variants={item}
        className="mt-6 max-w-xl text-sm leading-relaxed text-muted/90 sm:text-base"
      >
        Run admissions, CRM, scholarship exams, teachers, students, parents,
        finance, reports and executive decisions from one connected SaaS
        platform.
      </motion.p>

      <motion.div
        variants={item}
        className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
        onMouseEnter={onCorePulse}
        onFocus={onCorePulse}
      >
        <Link href="/demo" onMouseEnter={onCorePulse}>
          <PrimaryButton size="lg" className="w-full sm:w-auto">
            Request Demo
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </Link>
        <Link href="/features" onMouseEnter={onCorePulse}>
          <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
            Explore Platform
          </PrimaryButton>
        </Link>
      </motion.div>

      <motion.div
        variants={item}
        className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted/80 lg:justify-start"
      >
        {TRUST.map((label, i) => (
          <span key={label} className="flex items-center gap-2">
            {i > 0 && (
              <span className="hidden h-1 w-1 rounded-full bg-accent/50 sm:inline-block" />
            )}
            {label}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
