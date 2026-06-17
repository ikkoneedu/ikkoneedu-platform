import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Girişin solunda gösterilen ikon. */
  icon?: LucideIcon;
}

/**
 * Form metin girişi.
 * Etiket, opsiyonel ikon ve premium cam yüzeyli giriş alanı sağlar.
 */
export function TextField({
  label,
  icon: Icon,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        )}
        <input
          id={inputId}
          className={[
            "w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm text-content",
            "placeholder:text-muted/60 transition-colors",
            "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
            Icon ? "pl-11 pr-4" : "px-4",
            className,
          ].join(" ")}
          {...props}
        />
      </div>
    </div>
  );
}
