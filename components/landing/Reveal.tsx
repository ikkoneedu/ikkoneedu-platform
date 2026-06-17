"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  /** Animasyon gecikmesi (saniye). */
  delay?: number;
  className?: string;
}

/**
 * Görünüme girince hafif yukarı kayma + fade animasyonu uygular.
 * Pazarlama bölümlerinde tutarlı giriş hareketi sağlar.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
