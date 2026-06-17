"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SITE } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="bg-radial-glow min-h-screen w-full">
      <PageShell>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <GlassCard className="flex flex-col items-center gap-6 text-center sm:p-10">
            <LogoMark size={56} />

            <h1 className="text-4xl font-bold tracking-tight text-content sm:text-5xl">
              {SITE.name}
            </h1>

            <p className="text-base font-medium text-accent sm:text-lg">
              {SITE.tagline}
            </p>

            <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {SITE.description}
            </p>

            <PrimaryButton type="button">
              Projeyi Başlat
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </GlassCard>
        </motion.div>
      </PageShell>
    </div>
  );
}
