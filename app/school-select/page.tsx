"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, CircleUser } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SchoolCard } from "@/components/school/SchoolCard";
import { productName } from "@/lib/constants";
import { schoolOptions, tenantFeatures, type SchoolOption } from "@/lib/mock-data";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function SchoolSelectPage() {
  const router = useRouter();

  const handleSelect = (option: SchoolOption) => {
    router.push(option.href);
  };

  return (
    <div className="mesh-bg min-h-screen w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Üst bar — marka + profil/çıkış */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight text-content">
              {productName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-accent">
                <CircleUser size={20} aria-hidden="true" />
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight text-content">
                  Yönetici
                </p>
                <p className="text-xs leading-tight text-muted">
                  ikkdijital@gmail.com
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.08] hover:text-content"
            >
              <LogOut size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        </header>

        {/* Başlık */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-12"
        >
          <SectionHeader
            align="center"
            title="Okulunuzu Seçin"
            description="Bağlı olduğunuz kampüs veya kurumu seçerek devam edin."
          />
        </motion.div>

        {/* Okul kartları */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {schoolOptions.map((option) => (
            <SchoolCard key={option.id} option={option} onSelect={handleSelect} />
          ))}
        </motion.section>

        {/* Alt bölüm — tenant altyapısı açıklama kartları */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            ikkoneedu Çoklu Okul Altyapısı
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tenantFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={feature.id} className="p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-content">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
