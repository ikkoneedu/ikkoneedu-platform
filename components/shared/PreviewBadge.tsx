"use client";

import { FlaskConical } from "lucide-react";
import { useT } from "@/components/i18n/LocaleProvider";

interface PreviewBadgeProps {
  /** AI varyantı: "Demo · gerçek AI sonraki faz" metnini gösterir. */
  ai?: boolean;
  className?: string;
}

/**
 * Önizleme / demo-veri rozeti.
 * Mock veriyle çalışan panellerin tanıtım amaçlı olduğunu net belirtir.
 * Client bileşeni; hem sunucu hem client ebeveynlere yerleştirilebilir.
 */
export function PreviewBadge({ ai = false, className = "" }: PreviewBadgeProps) {
  const t = useT();
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300",
        className,
      ].join(" ")}
    >
      <FlaskConical size={11} aria-hidden="true" />
      {t(ai ? "preview.badge.ai" : "preview.badge")}
    </span>
  );
}
