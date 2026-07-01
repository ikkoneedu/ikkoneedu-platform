"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, LogIn, School } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { DragonAIBot } from "@/components/ai/DragonAIBot";
import { GATEWAY_SCHOOLS, type PublicSchool } from "@/lib/tenant/tenant-config";
import { productName } from "@/lib/constants";

/**
 * Okula özel logo dosyaları — yalnızca yüklenmiş olanlar burada eşlenir.
 * Eşleşme yoksa marka rengiyle çerçevelenmiş varsayılan logo gösterilir
 * (bkz. `SchoolBadge`) — yeni bir okul eklendiğinde kod değişikliği
 * gerekmeden `GATEWAY_SCHOOLS`'tan otomatik burada da listelenir.
 */
const SCHOOL_LOGO_FILES: Record<string, string> = {
  "ingiliz-kultur": "/school-logos/ikk-logo.png",
};

function SchoolBadge({ school, size = 72 }: { school: PublicSchool; size?: number }) {
  const logoSrc = SCHOOL_LOGO_FILES[school.slug];
  if (logoSrc) {
    return (
      <Image
        src={logoSrc}
        alt={`${school.schoolName} logosu`}
        width={size}
        height={size}
        className="rounded-2xl object-contain"
        priority
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        backgroundColor: `${school.brandColor}22`,
        border: `1px solid ${school.brandColor}55`,
      }}
    >
      <LogoMark size={Math.round(size * 0.6)} />
    </span>
  );
}

/**
 * Giriş kapısı — landing sayfasındaki "Giriş Yap" burayı açar. Önce okul
 * seçilir (şimdilik yalnız İngiliz Kültür Kolejleri; yeni okul eklendiğinde
 * `GATEWAY_SCHOOLS`'tan otomatik burada da beliri), sonra o okula özel
 * markalı bir karşılama ekranı gösterilir; oradan gerçek `/login`e geçilir.
 */
export default function EnterPage() {
  const [selected, setSelected] = useState<PublicSchool | null>(
    GATEWAY_SCHOOLS.length === 1 ? GATEWAY_SCHOOLS[0] : null,
  );

  return (
    <div className="mesh-bg relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-navy/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <Link href="/" className="relative mb-8 flex items-center gap-2.5">
        <LogoMark size={32} />
        <span className="text-lg font-semibold tracking-tight text-content">{productName}</span>
      </Link>

      <div className="relative w-full max-w-xl">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="pick"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <GlassCard tone="navy" className="sm:p-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  <School size={14} aria-hidden="true" />
                  Okulunuzu Seçin
                </span>
                <h1 className="mt-4 text-xl font-bold tracking-tight text-content sm:text-2xl">
                  Hangi okula giriş yapmak istiyorsunuz?
                </h1>
                <div className="mt-6 flex flex-col gap-3">
                  {GATEWAY_SCHOOLS.map((school) => (
                    <button
                      key={school.slug}
                      type="button"
                      onClick={() => setSelected(school)}
                      className="flex items-center gap-4 rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-overlay/[0.06]"
                    >
                      <SchoolBadge school={school} size={56} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-content">{school.schoolName}</p>
                        <p className="truncate text-xs text-muted">{school.campus}</p>
                      </div>
                      <ArrowRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <GlassCard tone="navy" className="relative overflow-visible text-center sm:p-10">
                {GATEWAY_SCHOOLS.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="absolute left-6 top-6 inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-content"
                  >
                    <ArrowLeft size={14} aria-hidden="true" />
                    Okul değiştir
                  </button>
                )}

                <div className="flex justify-center">
                  <SchoolBadge school={selected} size={84} />
                </div>

                <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent">
                  Dünyanın Dili Sizinle. Geleceğin Teknolojisi Bizimle.
                </p>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-content sm:text-3xl">
                  {selected.schoolName} Yapay Zeka Portalına Hoş Geldiniz
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                  {selected.intro}
                </p>

                <div className="relative mx-auto mt-8 flex h-40 items-center justify-center sm:h-48">
                  <DragonAIBot inline size={160} label={`${selected.schoolName} AI Asistanı`} />
                </div>

                <Link href={`/login?school=${selected.slug}`} className="mt-4 block">
                  <PrimaryButton size="lg" className="w-full">
                    <LogIn size={18} aria-hidden="true" />
                    Giriş Yap
                    <ArrowRight size={18} aria-hidden="true" />
                  </PrimaryButton>
                </Link>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
