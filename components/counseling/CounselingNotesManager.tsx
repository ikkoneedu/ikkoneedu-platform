"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { NotebookPen, Plus, AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  COUNSELING_TAGS,
  createCounselingSession,
  listCounselingSessions,
  type CounselingSessionRecord,
} from "@/lib/services/counseling";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { useT } from "@/components/i18n/LocaleProvider";

// Rehberlik (PDR) HASSAS veri — yalnızca yönetim + koordinatör (rehberlik).
// ÖĞRETMEN hariç (tüm öğrencilerin psikolojik danışma notlarını göremez).
// Gerçek güvenlik Firestore kurallarında (counselingSessions) zorlanır.
const STAFF_ROLES: string[] = [
  ROLES.COORDINATOR,
  ROLES.VICE_PRINCIPAL,
  ROLES.PRINCIPAL,
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.SUPER_ADMIN,
];

function formatDate(ms: number | null): string {
  if (!ms) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

/**
 * Rehberlik Görüşme Notları — GERÇEK Firestore (`counselingSessions`).
 * Personel öğrenci görüşme notu ekler; liste + CSV/PDF. Tenant izole.
 */
export function CounselingNotesManager() {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canManage = profile != null && STAFF_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canManage;

  const [rows, setRows] = useState<CounselingSessionRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    try {
      setRows(await listCounselingSessions(tenantId));
      setError(null);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="text-sm text-muted">
          <p className="font-semibold text-content">{t("panelFinance.notes.unavailable.title")}</p>
          <p className="mt-1">{t("panelFinance.notes.unavailable.body")}</p>
        </div>
      </GlassCard>
    );
  }

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId || !user || busy) return;
    const f = new FormData(e.currentTarget);
    const studentName = String(f.get("studentName") ?? "").trim();
    const tag = String(f.get("tag") ?? "");
    const note = String(f.get("note") ?? "").trim();
    if (!studentName || !note) {
      setError(t("panelFinance.notes.error.required"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createCounselingSession(tenantId, {
        studentName,
        tag,
        note,
        counselorUid: user.uid,
        counselorName: profile?.displayName,
      });
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={15} aria-hidden="true" /> {error}
        </p>
      )}

      {/* Not ekle */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("panelFinance.notes.add.heading")}</h2>
        </div>
        <form onSubmit={add} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label={t("panelFinance.notes.add.student")} name="studentName" placeholder={t("panelFinance.notes.add.studentPlaceholder")} required />
          <SelectField label={t("panelFinance.notes.add.tag")} name="tag" items={[...COUNSELING_TAGS]} />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-muted">{t("panelFinance.notes.add.note")}</label>
            <textarea
              name="note"
              rows={3}
              placeholder={t("panelFinance.notes.add.notePlaceholder")}
              className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Plus size={16} aria-hidden="true" />
              {busy ? t("panelFinance.notes.add.submitBusy") : t("panelFinance.notes.add.submit")}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>

      {/* Liste */}
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <NotebookPen size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("panelFinance.notes.list.heading")}</h2>
          <span className="text-xs text-muted">{rows?.length ?? 0}</span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
            aria-label={t("panelFinance.notes.list.refresh")}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
          {(rows?.length ?? 0) > 0 && (
            <DataExportButtons
              filename="rehberlik-notlari"
              title={t("panelFinance.notes.list.exportTitle")}
              formats={["pdf", "csv"]}
              columns={[
                { key: "studentName", label: t("panelFinance.notes.col.student") },
                { key: "tag", label: t("panelFinance.notes.col.tag") },
                { key: "note", label: t("panelFinance.notes.col.note") },
                { key: "counselorName", label: t("panelFinance.notes.col.counselor") },
              ]}
              rows={(rows ?? []) as unknown as Record<string, unknown>[]}
            />
          )}
        </div>

        {rows === null ? (
          <p className="text-sm text-muted">{t("panelFinance.notes.list.loading")}</p>
        ) : rows.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Inbox size={15} aria-hidden="true" /> {t("panelFinance.notes.list.empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((r) => (
              <li key={r.id} className="rounded-lg border border-overlay/10 bg-overlay/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-content">{r.studentName}</span>
                  {r.tag && (
                    <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-xs text-accent">
                      {r.tag}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{r.note}</p>
                <p className="mt-1 text-xs text-muted/70">
                  {formatDate(r.createdAt)}
                  {r.counselorName ? ` · ${r.counselorName}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
