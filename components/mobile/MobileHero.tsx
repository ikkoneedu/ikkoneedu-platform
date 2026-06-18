import { Smartphone } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { PhoneMockup } from "@/components/mobile/PhoneMockup";
import { ScreenContent } from "@/components/mobile/ScreenContent";
import { StoreButtons } from "@/components/mobile/StoreButtons";
import { productName } from "@/lib/constants";
import { mobileScreens } from "@/lib/mobile-mock-data";

/**
 * Mobil uygulama hero bölümü.
 * Sol tarafta güçlü metin + mağaza butonları, sağ tarafta telefon mockup'ı.
 */
export function MobileHero() {
  const heroScreen = mobileScreens[0];

  return (
    <section className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-20">
      <Reveal>
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-accent lg:mx-0">
            <Smartphone size={14} aria-hidden="true" />
            Mobil Uygulama — {productName}
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-content sm:text-5xl lg:text-6xl">
            Okulunuz Cebinizde
          </h1>

          <p className="text-lg font-medium text-accent">
            Veli, öğrenci, öğretmen ve yöneticiler için tasarlanmış yeni nesil
            mobil deneyim.
          </p>

          <p className="text-base leading-relaxed text-muted">
            {productName} mobil uygulaması sayesinde okulunuzla ilgili tüm
            süreçlere her yerden erişin.
          </p>

          <StoreButtons className="justify-center lg:justify-start" />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <PhoneMockup>
          <ScreenContent title={heroScreen.title} rows={heroScreen.rows} />
        </PhoneMockup>
      </Reveal>
    </section>
  );
}
