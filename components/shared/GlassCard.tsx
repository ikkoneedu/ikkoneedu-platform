import type { HTMLAttributes, ReactNode } from "react";

type GlassTone = "default" | "navy";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Hover durumunda hafif yükselme efekti ekler. */
  interactive?: boolean;
  /** Yüzey tonu: nötr cam veya lacivert tonlu cam (Stitch glass-panel). */
  tone?: GlassTone;
}

const TONE_STYLES: Record<GlassTone, string> = {
  default: "bg-overlay/[0.04]",
  navy: "bg-navy/50",
};

/**
 * Cam efektli (glassmorphism) yüzey bileşeni.
 * Premium SaaS estetiği: yumuşak sınır, yuvarlatılmış köşe, derin gölge,
 * iç kısımda ince ışık vurgusu.
 */
export function GlassCard({
  children,
  className = "",
  interactive = false,
  tone = "default",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-overlay/10 p-6",
        TONE_STYLES[tone],
        "shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        "ring-1 ring-inset ring-overlay/[0.05]",
        interactive
          ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-overlay/[0.06]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
