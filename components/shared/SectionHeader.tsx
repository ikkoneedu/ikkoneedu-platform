import type { ReactNode } from "react";

interface SectionHeaderProps {
  /** Başlık üstündeki küçük etiket (opsiyonel). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Sağ tarafa hizalanan eylem alanı (buton vb.). */
  action?: ReactNode;
  /** İçeriği ortala (kahraman bölümleri için). */
  align?: "left" | "center";
  className?: string;
}

/**
 * Bölüm başlığı bileşeni.
 * Sayfa ve kart bölümlerinde tutarlı başlık tipografisi sağlar.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={[
        "flex w-full gap-4",
        isCenter
          ? "flex-col items-center text-center"
          : "flex-col items-start sm:flex-row sm:items-end sm:justify-between",
        className,
      ].join(" ")}
    >
      <div className={isCenter ? "max-w-2xl" : ""}>
        {eyebrow && (
          <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
