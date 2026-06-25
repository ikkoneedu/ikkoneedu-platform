"use client";

import { Smartphone } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { PhoneMockup } from "@/components/mobile/PhoneMockup";
import { ScreenContent } from "@/components/mobile/ScreenContent";
import { StoreButtons } from "@/components/mobile/StoreButtons";
import { useT } from "@/components/i18n/LocaleProvider";
import { productName } from "@/lib/constants";
import { mobileScreens } from "@/lib/mobile-mock-data";

/**
 * Mobil uygulama hero bölümü.
 * Sol tarafta güçlü metin + mağaza butonları, sağ tarafta telefon mockup'ı.
 */
export function MobileHero() {
  const t = useT();
  const heroScreen = mobileScreens[0];

  return (
    <section className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-20">
      <Reveal>
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs font-medium text-accent lg:mx-0">
            <Smartphone size={14} aria-hidden="true" />
            {t("mobileApp.hero.badge", { product: productName })}
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-content sm:text-5xl lg:text-6xl">
            {t("mobileApp.hero.title")}
          </h1>

          <p className="text-lg font-medium text-accent">
            {t("mobileApp.hero.subtitle")}
          </p>

          <p className="text-base leading-relaxed text-muted">
            {t("mobileApp.hero.description", { product: productName })}
          </p>

          <StoreButtons className="justify-center lg:justify-start" />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <PhoneMockup>
          <ScreenContent
            title={t("mobileApp.screen.veli.title")}
            rows={heroScreen.rows.map((_, i) => t(`mobileApp.screen.veli.row.${i}`))}
          />
        </PhoneMockup>
      </Reveal>
    </section>
  );
}
