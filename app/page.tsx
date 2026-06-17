"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { PRODUCT } from "@/lib/constants";
import { metrics } from "@/lib/mock-data";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <PageShell title="Genel Bakış">
      <div className="flex flex-col gap-10">
        {/* Kahraman bölümü */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <GlassCard className="flex flex-col items-center gap-5 text-center sm:p-10">
            <LogoMark size={56} />

            <h1 className="text-3xl font-bold tracking-tight text-content sm:text-5xl">
              {PRODUCT.name}
            </h1>

            <p className="text-base font-medium text-accent sm:text-lg">
              {PRODUCT.tagline}
            </p>

            <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {PRODUCT.description}
            </p>

            <PrimaryButton type="button" size="lg">
              Projeyi Başlat
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </GlassCard>
        </motion.div>

        {/* İstatistik bölümü */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <SectionHeader
            eyebrow="Genel Durum"
            title="Platform Metrikleri"
            description="Ortak tasarım bileşenleriyle oluşturulmuş örnek gösterge paneli."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <StatCard
                key={metric.id}
                label={metric.label}
                value={metric.value}
                delta={metric.delta}
                trend={metric.trend}
                icon={metric.icon}
              />
            ))}
          </div>
        </motion.section>
      </div>
    </PageShell>
  );
}
