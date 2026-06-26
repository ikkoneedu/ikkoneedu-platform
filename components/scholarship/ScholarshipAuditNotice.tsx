"use client";

import { Info } from "lucide-react";
import { useT } from "@/components/i18n/LocaleProvider";

/**
 * Bursluluk paneli dürüstlük şeridi (Faz 5).
 * Hangi bölümlerin CANLI, hangilerinin ÖNİZLEME/demo veri olduğunu açıkça belirtir.
 */
export function ScholarshipAuditNotice() {
  const t = useT();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-navy/50 text-amber-300">
        <Info size={18} aria-hidden="true" />
      </span>
      <div className="text-sm">
        <p className="font-semibold text-content">{t("scholarship.audit.title")}</p>
        <p className="mt-0.5 text-muted">{t("scholarship.audit.body")}</p>
      </div>
    </div>
  );
}
