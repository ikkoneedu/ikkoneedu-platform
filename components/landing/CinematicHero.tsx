"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HeroOverlay } from "@/components/landing/HeroOverlay";
import type { MousePos } from "@/components/landing/EducationNetworkScene";

const EducationNetworkScene = dynamic(
  () =>
    import("@/components/landing/EducationNetworkScene").then(
      (m) => m.EducationNetworkScene,
    ),
  { ssr: false, loading: () => <SceneFallback /> },
);

function SceneFallback() {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-1/2 top-[44%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(178,199,239,0.5),transparent_65%)] blur-2xl" />
    </div>
  );
}

/**
 * Sinematik ilk açılış deneyimi — "Initializing Education Network".
 *
 * Education Network sahnesini (canvas + cam düğümler) arka planda, hero
 * metnini ön planda render eder. Fare paralaksını ve CTA "pulse" sinyalini
 * ref'ler üzerinden sahneye iletir; prefers-reduced-motion'a saygı gösterir.
 */
export function CinematicHero() {
  const mouseRef = useRef<MousePos>({ x: 0, y: 0 });
  const pulseRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) setReady(true);
    const onChange = () => {
      setReduced(mq.matches);
      if (mq.matches) setReady(true);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const handleMouse = useCallback((e: React.MouseEvent<HTMLElement>) => {
    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, []);

  const triggerPulse = useCallback(() => {
    pulseRef.current = performance.now();
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  return (
    <section
      onMouseMove={handleMouse}
      className="relative w-full overflow-hidden border-b border-white/5 bg-background"
      aria-label="IKK ONE EDU OS"
    >
      {/* 3B / canvas ağ sahnesi (yalnızca istemci) */}
      {mounted && (
        <EducationNetworkScene
          mouseRef={mouseRef}
          pulseRef={pulseRef}
          reduced={reduced}
          onReady={handleReady}
        />
      )}

      {/* Perspektif ızgara zemini — komuta merkezi hissi */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] overflow-hidden [perspective:520px]">
        <div className="absolute inset-x-[-50%] bottom-[-10%] top-0 origin-bottom [transform:rotateX(72deg)] bg-[linear-gradient(rgba(178,199,239,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(178,199,239,0.18)_1px,transparent_1px)] bg-[length:54px_54px] opacity-40 [mask-image:linear-gradient(to_top,black,transparent_85%)]" />
      </div>

      {/* Okunabilirlik için sol karartma + yumuşak vinyet */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_120%_at_0%_45%,rgba(5,12,22,0.92),rgba(5,12,22,0.35)_45%,transparent_68%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_50%,transparent_45%,rgba(5,12,22,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* HUD köşe çerçeveleri */}
      <div className="pointer-events-none absolute left-5 top-5 h-7 w-7 border-l border-t border-accent/25 sm:left-7 sm:top-7" />
      <div className="pointer-events-none absolute right-5 top-5 h-7 w-7 border-r border-t border-accent/25 sm:right-7 sm:top-7" />
      <div className="pointer-events-none absolute bottom-5 left-5 h-7 w-7 border-b border-l border-accent/25 sm:bottom-7 sm:left-7" />
      <div className="pointer-events-none absolute bottom-5 right-5 h-7 w-7 border-b border-r border-accent/25 sm:bottom-7 sm:right-7" />

      {/* Açılış metni — hazır olunca kaybolur */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6"
          >
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.35em" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="font-mono text-[11px] uppercase text-accent/85 sm:text-xs"
            >
              Eğitim Ağı Başlatılıyor
              <BlinkingDots />
            </motion.span>
            <div className="mt-4 h-px w-44 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-transparent via-accent to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero ön katmanı */}
      <HeroOverlay visible={ready} onCorePulse={triggerPulse} />

      {/* Aşağı kaydır ipucu */}
      <AnimatePresence>
        {ready && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-muted/60"
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="block"
            >
              <ChevronDown size={22} aria-hidden="true" />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function BlinkingDots() {
  return (
    <motion.span
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 1.4, repeat: Infinity }}
      aria-hidden="true"
    >
      ...
    </motion.span>
  );
}
