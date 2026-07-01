"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const MASCOT_SRC = "/mascot/dragon-ai-robot.png";
const DEFAULT_GREETING = "Merhaba! Size yardımcı olabilirim.";
const GREETING_DURATION_MS = 3200;

export interface DragonAIBotWings {
  left: string;
  right: string;
}

export interface DragonAIBotProps {
  /** Görsel boyutu (px, kare). Masaüstü varsayılan 96; mobilde otomatik küçülür (bkz. `inline`). */
  size?: number;
  /** Tıklanınca çıkan konuşma balonu metni. */
  greeting?: string;
  /** Erişilebilirlik etiketi (buton `aria-label`'ı). */
  label?: string;
  /**
   * true ise sabit sağ-alt köşe konumlandırması UYGULANMAZ — hero/karşılama
   * sayfası gibi elle yerleştirilen kullanımlar içindir. Varsayılan (false)
   * masaüstünde sağ-alt, mobilde daha küçük ve alt gezinme çubuğunun üzerinde
   * kalacak şekilde sabit bir AI yardımcı widget'ı davranışı uygular.
   */
  inline?: boolean;
  className?: string;
  /**
   * İleride kanatlar ayrı PNG olarak verilirse buradan geçilir; verilmezse
   * tek-PNG modu kullanılır (CSS ile hafif nefes alma/kanat çırpma hissi).
   * Verildiğinde gövde ortada, kanatlar solda/sağda ayrı katman olarak
   * kendi hafif çırpma animasyonlarıyla render edilir.
   */
  wings?: DragonAIBotWings;
}

/**
 * Sevimli ejderha AI robot maskotu — reusable, erişilebilir, hafif.
 *
 * Sürekli (CSS keyframes, GPU dostu): hafif süzülme + ara sıra dönüş + nefes
 * alma/göz kırpma hissi (bkz. `app/globals.css` `.dragon-bot-*` sınıfları).
 * Etkileşim (Framer Motion, zaten proje bağımlılığı): hover'da büyüme,
 * tıklamada zıplama + "Merhaba!" konuşma balonu.
 */
export function DragonAIBot({
  size = 96,
  greeting = DEFAULT_GREETING,
  label = "IKK AI Asistanı",
  inline = false,
  className = "",
  wings,
}: DragonAIBotProps) {
  const [greeted, setGreeted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleClick = useCallback(() => {
    setGreeted(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setGreeted(false), GREETING_DURATION_MS);
  }, []);

  return (
    <div
      className={[
        inline ? "relative inline-block" : "fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AnimatePresence>
        {greeted && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="status"
            className="absolute -top-3 right-0 w-56 -translate-y-full rounded-2xl border border-accent/30 bg-navy/95 px-4 py-3 text-sm font-medium text-content shadow-xl backdrop-blur-sm"
          >
            {greeting}
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-accent/30 bg-navy/95"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleClick}
        aria-label={label}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        animate={greeted ? { y: [0, -20, 0] } : { y: 0 }}
        transition={greeted ? { duration: 0.55, ease: "easeOut" } : { duration: 0.2 }}
        className="block cursor-pointer rounded-full border-none bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={
          inline
            ? { width: size, height: size }
            : // Mobilde otomatik küçülür (viewport'a göre), masaüstünde `size`'a sabitlenir —
              // içeriği/alt gezinme çubuğunu kapatmaz (bkz. dış kapsayıcı `bottom-20 sm:bottom-6`).
              { width: `clamp(56px, 16vw, ${size}px)`, height: `clamp(56px, 16vw, ${size}px)` }
        }
      >
        <div className="dragon-bot-float h-full w-full">
          <div className="dragon-bot-sway h-full w-full">
            {wings ? (
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element -- dinamik dış kanat kaynağı, next/image domain kısıtı gerektirmesin */}
                <img
                  src={wings.left}
                  alt=""
                  aria-hidden="true"
                  className="dragon-bot-body absolute inset-0 h-full w-full origin-right object-contain"
                  style={{ animationDelay: "-0.6s" }}
                />
                <Image
                  src={MASCOT_SRC}
                  alt=""
                  width={size}
                  height={size}
                  className="relative h-full w-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- dinamik dış kanat kaynağı, next/image domain kısıtı gerektirmesin */}
                <img
                  src={wings.right}
                  alt=""
                  aria-hidden="true"
                  className="dragon-bot-body absolute inset-0 h-full w-full origin-left object-contain"
                />
              </div>
            ) : (
              <Image
                src={MASCOT_SRC}
                alt=""
                width={size}
                height={size}
                className="dragon-bot-body h-full w-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                priority={inline}
              />
            )}
          </div>
        </div>
      </motion.button>
    </div>
  );
}
