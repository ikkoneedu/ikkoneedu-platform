"use client";

import Link from "next/link";
import { ArrowRight, Mail, LogIn } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";

/**
 * Son çağrı (CTA) bölümü.
 * Demo, iletişim ve giriş yönlendirmelerini öne çıkaran kapanış kartı.
 */
export function CallToAction() {
  const t = useT();
  return (
    <section className="py-16 lg:py-24">
      <Reveal>
        <GlassCard
          tone="navy"
          className="ai-gradient flex flex-col items-center gap-6 border-accent/20 px-6 py-14 text-center sm:px-10"
        >
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-content sm:text-4xl">
            {t("features.cta.title")}
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/demo">
              <PrimaryButton size="lg" className="w-full sm:w-auto">
                {t("features.cta.requestDemo")}
                <ArrowRight size={18} aria-hidden="true" />
              </PrimaryButton>
            </Link>
            <Link href="/demo">
              <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
                <Mail size={18} aria-hidden="true" />
                İletişime Geç
              </PrimaryButton>
            </Link>
            <Link href="/login">
              <PrimaryButton variant="ghost" size="lg" className="w-full sm:w-auto">
                <LogIn size={18} aria-hidden="true" />
                Giriş Yap
              </PrimaryButton>
            </Link>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
