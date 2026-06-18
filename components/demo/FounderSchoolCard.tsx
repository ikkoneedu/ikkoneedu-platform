import { GraduationCap, Crown } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/landing/Reveal";

/**
 * Referans — Kurucu Okul kartı.
 * İngiliz Kültür Kolejleri'ni kurucu ortak olarak öne çıkarır.
 */
export function FounderSchoolCard() {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <GlassCard className="ai-gradient flex flex-col items-start gap-5 border-accent/20 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15 text-accent">
            <GraduationCap size={32} aria-hidden="true" />
          </span>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              <Crown size={13} aria-hidden="true" />
              Kurucu Okul
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-content">
              İngiliz Kültür Kolejleri
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              ikkoneedu platformunun ilk uygulama ve geliştirme ortağıdır.
            </p>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
