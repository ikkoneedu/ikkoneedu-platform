import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-content shadow-lg shadow-brand/20 hover:bg-brand/90 hover:shadow-brand/30",
  secondary:
    "border border-white/15 bg-white/[0.04] text-content hover:bg-white/[0.08] hover:border-white/25",
  ghost: "text-muted hover:bg-white/[0.06] hover:text-content",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

/**
 * Birincil eylem butonu.
 * Premium SaaS düğme dili: yumuşak gölge, net odak halkası, çeşitli varyantlar.
 */
export function PrimaryButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
        "transition-all duration-200 focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
