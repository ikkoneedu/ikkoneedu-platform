import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Hover durumunda hafif yükselme efekti ekler. */
  interactive?: boolean;
}

/**
 * Cam efektli (glassmorphism) yüzey bileşeni.
 * Premium SaaS estetiği: yumuşak sınır, yuvarlatılmış köşe, derin gölge.
 */
export function GlassCard({
  children,
  className = "",
  interactive = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/[0.04] p-6",
        "shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        "ring-1 ring-inset ring-white/[0.03]",
        interactive
          ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
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
