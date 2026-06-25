"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
  "Çok Kiracılı SaaS",
  "Özel Okullar İçin",
  "Kurucu Okul: İngiliz Kültür Kolejleri",
];

/**
 * Sinematik hero ön katmanı — açılış tamamlanınca yumuşakça belirir.
 * Split kompozisyon: metin solda; ağ sahnesi sağda (arka planda).
 */
export function HeroOverlay({ visible, onCorePulse }: HeroOverlayProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={visible ? "show" : "hidden"}
      className="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-6xl flex-col items-start justify-center px-5 text-left sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl">
        {/* Mono durum çipi — komuta merkezi hissi */}
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 rounded-md border border-accent/20 bg-accent/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-accent backdrop-blur-md sm:text-[11px]"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Sistem Aktif
          <span className="text-muted/70">{"//"} 12 modül çevrimiçi</span>
        </motion.div>

        {/* Aksan çizgisi */}
        <motion.div
          variants={item}
          className="mt-7 h-px w-16 bg-gradient-to-r from-brand to-transparent"
        />

        <motion.h1
          variants={item}
          className="mt-4 text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="bg-gradient-to-br from-white via-accent to-overlay/70 bg-clip-text text-transparent text-glow">
            IKK ONE
          </span>
          <br />
          <span className="bg-gradient-to-br from-white via-accent to-overlay/70 bg-clip-text text-transparent text-glow">
            EDU OS
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 text-xl font-semibold tracking-tight text-content sm:text-2xl"
        >
          Tek Ağ. Tek Platform.{" "}
          <span className="text-brand">Tek Gelecek.</span>
        </motion.p>

        <motion.p
          variants={item}
          className="mt-2 font-mono text-sm uppercase tracking-[0.18em] text-muted sm:text-base"
        >
          Modern Eğitimin İşletim Sistemi
        </motion.p>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-sm leading-relaxed text-muted/90 sm:text-base"
        >
          Kayıt kabul, CRM, bursluluk sınavları, öğretmenler, öğrenciler,
          veliler, finans, raporlar ve yönetim kararlarını tek bağlı SaaS
          platformundan yönetin.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          onMouseEnter={onCorePulse}
          onFocus={onCorePulse}
        >
          <Link href="/demo" onMouseEnter={onCorePulse}>
            <PrimaryButton size="lg" className="w-full sm:w-auto">
              Demo Talep Et
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </Link>
          <Link href="/features" onMouseEnter={onCorePulse}>
            <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
              Platformu Keşfet
            </PrimaryButton>
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-muted/70"
        >
          {TRUST.map((label, i) => (
            <span key={label} className="flex items-center gap-3">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-brand/60" />}
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
