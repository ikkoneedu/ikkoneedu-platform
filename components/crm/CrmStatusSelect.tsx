"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/LocaleProvider";
import {
  CRM_STATUSES,
  crmStatusLabel,
  updateCrmStatus,
  type CrmStatus,
} from "@/lib/services/crm-actions";
import type { CrmKind } from "@/lib/services/crm-global";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STATUS_STYLE: Record<string, string> = {
  new: "border-overlay/15 text-muted",
  contacted: "border-sky-400/30 text-sky-300",
  qualified: "border-amber-400/30 text-amber-300",
  converted: "border-emerald-400/30 text-emerald-300",
  lost: "border-brand/30 text-brand",
};

/**
 * CRM kaydı durum seçici. Seçim değişince ilgili belgeyi günceller.
 * Okul personeli kendi okulunun, süper admin tüm okulların kayıtlarını yönetir
 * (yetki kurallarla zorlanır).
 */
export function CrmStatusSelect({
  tenantId,
  kind,
  id,
  status,
  onChanged,
  onError,
  onAction,
}: {
  tenantId: string;
  kind: CrmKind;
  id: string;
  status: string;
  onChanged?: () => void | Promise<void>;
  onError?: (message: string) => void;
  onAction?: (status: CrmStatus) => void | Promise<void>;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState(status);

  // Bilinen durumlar için çeviri; bilinmeyenler (ör. "received") servis etiketine düşer.
  const statusLabel = (s: string) =>
    (CRM_STATUSES as readonly string[]).includes(s)
      ? t(`panelCrm.crmStatus.${s}`)
      : crmStatusLabel(s);

  const handle = async (next: string) => {
    const status = next as CrmStatus;
    setBusy(true);
    const prev = value;
    setValue(status);
    try {
      await updateCrmStatus({ tenantId, kind, id, status });
      await onAction?.(status);
      await onChanged?.();
    } catch (err) {
      setValue(prev);
      onError?.(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // Mevcut değer listede yoksa (ör. "received") seçili görünmesi için ekle.
  const options = (CRM_STATUSES as readonly string[]).includes(value)
    ? CRM_STATUSES
    : [value, ...CRM_STATUSES];

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => void handle(e.target.value)}
      className={`rounded-lg border bg-overlay/[0.04] px-2 py-1 text-xs outline-none focus:border-accent disabled:opacity-50 ${STATUS_STYLE[value] ?? "border-overlay/15 text-content"}`}
      aria-label={t("panelCrm.crmStatus.ariaLabel")}
    >
      {options.map((s) => (
        <option key={s} value={s} className="bg-surface text-content">
          {statusLabel(s)}
        </option>
      ))}
    </select>
  );
}
