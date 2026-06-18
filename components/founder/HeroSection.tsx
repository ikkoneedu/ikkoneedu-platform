import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { productName } from "@/lib/constants";

/**
 * Kurucu Okul hero bölümü.
 * İngiliz Kültür Kolejleri'nin stratejik ortak rolünü prestijli biçimde sunar.
 */
export function HeroSection() {
  return (
    <Reveal>
      <section className="flex flex-col items-center gap-6 py-16 text-center lg:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          <Crown size={14} aria-hidden="true" />
          Kurucu Okul & Stratejik Ortak
        </span>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-content sm:text-5xl lg:text-6xl">
          Kurucu Okul ve Stratejik Ortak
        </h1>

        <p className="max-w-3xl text-lg font-medium text-accent">
          İngiliz Kültür Kolejleri, {productName} platformunun ilk uygulama,
          geliştirme ve büyüme ortağıdır.
        </p>

        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {productName}, gerçek okul ihtiyaçları üzerinden geliştirilen ve eğitim
          sektörünün geleceğini şekillendirmeyi hedefleyen yapay zeka destekli
          eğitim işletim sistemidir.
        </p>

        <Link href="/features">
          <PrimaryButton size="lg">
            Platformu İncele
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </Link>
      </section>
    </Reveal>
  );
}
