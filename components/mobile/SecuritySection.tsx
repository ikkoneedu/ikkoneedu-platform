"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";
import type { SecurityItem } from "@/lib/mobile-mock-data";

interface SecuritySectionProps {
  items: SecurityItem[];
}

/**
 * Mobil Güvenlik bölümü.
 * Biyometrik giriş, güvenli kimlik doğrulama ve şifreli iletim özellikleri.
 */
export function SecuritySection({ items }: SecuritySectionProps) {
  const t = useT();
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow={t("mobileApp.security.eyebrow")}
          title={t("mobileApp.security.title")}
        />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.id} delay={index * 0.07}>
              <GlassCard tone="navy" interactive className="flex flex-col items-center p-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-content">
                  {t(`mobileApp.security.${item.id}`)}
                </h3>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
