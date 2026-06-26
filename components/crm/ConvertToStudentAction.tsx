"use client";

import { useState } from "react";
import { UserCheck, Copy, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useT } from "@/components/i18n/LocaleProvider";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { ROLES } from "@/lib/auth/role-constants";
import { createCodedAccount } from "@/lib/services/access-codes";
import { updateCrmStatus } from "@/lib/services/crm-actions";
import type { CrmKind } from "@/lib/services/crm-global";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

interface ConvertResult {
  studentCode: string;
  parentCode?: string;
}

/**
 * Bursluluk başvurusu / aday talebini ÖĞRENCİ kaydına dönüştürür.
 *
 * Mevcut modele uygun: öğrenci hesabı erişim KODU ile üretilir
 * (createCodedAccount), e-posta uydurulmaz. Başvuruda veli adı varsa öğrenciye
 * BAĞLI bir veli kodu da üretilir. Üretilen kod(lar) personele gösterilir ve
 * aileye iletilir. Ardından CRM kaydı "Kayıt oldu" (converted) işaretlenir.
 */
export function ConvertToStudentAction({
  tenantId,
  kind,
  id,
  studentName,
  parentName,
  staffUid,
  staffName,
  onConverted,
}: {
  tenantId: string;
  kind: CrmKind;
  id: string;
  studentName: string;
  /** Verilirse öğrenciye bağlı bir veli kodu da üretilir. */
  parentName?: string;
  staffUid: string;
  staffName?: string;
  onConverted?: () => void | Promise<void>;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const convert = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const student = await createCodedAccount({
        tenantId,
        teacherUid: staffUid,
        teacherName: staffName,
        role: ROLES.STUDENT,
        displayName: studentName || "Öğrenci",
      });

      let parentCode: string | undefined;
      const pName = parentName?.trim();
      if (pName) {
        const parent = await createCodedAccount({
          tenantId,
          teacherUid: staffUid,
          teacherName: staffName,
          role: ROLES.PARENT,
          displayName: pName,
          linkedStudentIds: [student.uid],
          linkedStudents: [{ uid: student.uid, displayName: student.displayName }],
        });
        parentCode = parent.code;
      }

      await updateCrmStatus({ tenantId, kind, id, status: "converted" });
      setResult({ studentCode: student.code, parentCode });
      await onConverted?.();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  if (result) {
    return (
      <div className="flex flex-col gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-2.5 py-2">
        <CodeRow
          label={t("panelCrm.convert.studentCode")}
          code={result.studentCode}
          copied={copied === result.studentCode}
          onCopy={() => copy(result.studentCode)}
        />
        {result.parentCode && (
          <CodeRow
            label={t("panelCrm.convert.parentCode")}
            code={result.parentCode}
            copied={copied === result.parentCode}
            onCopy={() => copy(result.parentCode!)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <PrimaryButton type="button" variant="secondary" size="sm" onClick={convert} disabled={busy}>
        <UserCheck size={14} aria-hidden="true" />
        {busy ? t("panelCrm.convert.busy") : t("panelCrm.convert.action")}
      </PrimaryButton>
      {error && (
        <span className="flex items-center gap-1 text-xs text-brand">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
          <button type="button" onClick={() => setError(null)} aria-label={t("panelCrm.convert.close")}>
            <X size={12} />
          </button>
        </span>
      )}
    </div>
  );
}

function CodeRow({
  label,
  code,
  copied,
  onCopy,
}: {
  label: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={13} className="shrink-0 text-emerald-400" aria-hidden="true" />
      <span className="text-xs text-content">
        {label}: <span className="font-mono text-emerald-300">{code}</span>
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="ml-auto text-muted transition hover:text-content"
        aria-label={t("panelCrm.convert.copy", { label })}
      >
        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}
