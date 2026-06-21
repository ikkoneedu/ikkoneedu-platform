"use client";

import { useState } from "react";
import { UserCheck, Copy, CheckCircle2, AlertCircle, X } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { ROLES } from "@/lib/auth/role-constants";
import { createCodedAccount } from "@/lib/services/access-codes";
import { updateCrmStatus } from "@/lib/services/crm-actions";
import type { CrmKind } from "@/lib/services/crm-global";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/**
 * Bursluluk başvurusu / aday talebini ÖĞRENCİ kaydına dönüştürür.
 *
 * Mevcut modele uygun: öğrenci hesabı erişim KODU ile üretilir
 * (createCodedAccount). Üretilen kod personele gösterilir; aileye iletilir.
 * Ardından CRM kaydı "Kayıt oldu" (converted) olarak işaretlenir.
 */
export function ConvertToStudentAction({
  tenantId,
  kind,
  id,
  studentName,
  staffUid,
  staffName,
  onConverted,
}: {
  tenantId: string;
  kind: CrmKind;
  id: string;
  studentName: string;
  staffUid: string;
  staffName?: string;
  onConverted?: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const convert = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await createCodedAccount({
        tenantId,
        teacherUid: staffUid,
        teacherName: staffName,
        role: ROLES.STUDENT,
        displayName: studentName || "Öğrenci",
      });
      await updateCrmStatus({ tenantId, kind, id, status: "converted" });
      setCode(result.code);
      await onConverted?.();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (code) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-2.5 py-1.5">
        <CheckCircle2 size={14} className="shrink-0 text-emerald-400" aria-hidden="true" />
        <span className="text-xs text-content">
          Öğrenci kodu: <span className="font-mono text-emerald-300">{code}</span>
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="ml-auto text-muted transition hover:text-content"
          aria-label="Kodu kopyala"
        >
          {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <PrimaryButton type="button" variant="secondary" size="sm" onClick={convert} disabled={busy}>
        <UserCheck size={14} aria-hidden="true" />
        {busy ? "Dönüştürülüyor…" : "Kayda Dönüştür"}
      </PrimaryButton>
      {error && (
        <span className="flex items-center gap-1 text-xs text-brand">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
          <button type="button" onClick={() => setError(null)} aria-label="Kapat">
            <X size={12} />
          </button>
        </span>
      )}
    </div>
  );
}
