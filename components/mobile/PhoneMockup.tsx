import type { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

/**
 * iPhone tarzı premium telefon mockup'ı.
 * Çentik (notch), ince çerçeve ve cam yüzey ile içerik (ekran) sarmalanır.
 */
export function PhoneMockup({ children, className = "" }: PhoneMockupProps) {
  return (
    <div className={`relative mx-auto w-[250px] max-w-full ${className}`}>
      {/* Arka ışıma */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-accent/10 blur-3xl" />

      {/* Gövde */}
      <div className="rounded-[2.6rem] border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.02] p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        {/* Ekran */}
        <div className="relative aspect-[9/19] overflow-hidden rounded-[2.1rem] border border-white/10 bg-background">
          {/* Çentik */}
          <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
          {/* İçerik */}
          <div className="h-full overflow-hidden pt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
