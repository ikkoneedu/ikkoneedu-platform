"use client";

import { useEffect, useState } from "react";
import {
  Rocket,
  ChevronDown,
  ArrowRightCircle,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useT } from "@/components/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import {
  listDemoRequests,
  updateDemoRequest,
  convertDemoToLead,
  demoStatusLabel,
  DEMO_STATUSES,
  type DemoRequestRecord,
  type DemoStatus,
} from "@/lib/services/demo-requests";
import { listSchools, type SchoolRecord } from "@/lib/services/schools";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/**
 * Demo talepleri yönetim tablosu (gerçek Firestore — `platformDemoRequests`).
 * Yalnızca giriş yapmış SUPER_ADMIN + Firebase aktifken görünür.
 *
 * Süper admin: durum değiştirir, not + atanan kişi ekler, talebi CRM lead'ine
 * çevirir (okul seçiliyse tenant lead'i; değilse platform satış lead'i).
 */
export function DemoRequestsInbox() {
  const t = useT();
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;

  const [items, setItems] = useState<DemoRequestRecord[] | null>(null);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady || !isSuper) return;
    let active = true;
    void (async () => {
      const [reqs, sch] = await Promise.all([listDemoRequests(), listSchools()]);
      if (!active) return;
      setItems(reqs);
      setSchools(sch);
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, isSuper]);

  const patchLocal = (id: string, patch: Partial<DemoRequestRecord>) =>
    setItems((prev) =>
      prev ? prev.map((r) => (r.id === id ? { ...r, ...patch } : r)) : prev,
    );

  const handleStatus = async (id: string, status: DemoStatus) => {
    setBusyId(id);
    setError(null);
    try {
      await updateDemoRequest(id, { status });
      patchLocal(id, { status });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveDetail = async (
    id: string,
    notes: string,
    assignedTo: string,
  ) => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await updateDemoRequest(id, { notes, assignedTo });
      patchLocal(id, { notes, assignedTo });
      setNotice(t("panelSaas.demo.saved"));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleConvert = async (demo: DemoRequestRecord, tenantId: string) => {
    setBusyId(demo.id);
    setError(null);
    setNotice(null);
    try {
      const result = await convertDemoToLead({
        demo,
        tenantId: tenantId || undefined,
      });
      if (!result.ok) {
        setError(result.error ?? t("panelSaas.demo.leadFailed"));
        return;
      }
      patchLocal(demo.id, {
        status: "converted",
        convertedToLeadId: result.leadId ?? "",
        leadTenantId: result.tenantId ?? "",
      });
      setNotice(
        result.tenantId
          ? t("panelSaas.demo.leadAddedToSchool", { tenant: result.tenantId })
          : t("panelSaas.demo.platformLeadCreated"),
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (!firebaseReady || !isSuper || items === null) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Rocket size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("panelSaas.demo.heading")}</h2>
        <span className="text-xs text-muted">{items.length}</span>
        {items.length > 0 && (
          <DataExportButtons
            className="ml-auto"
            filename={t("panelSaas.demo.export.filename")}
            title={t("panelSaas.demo.export.title")}
            columns={[
              { key: "institution", label: t("panelSaas.demo.col.institution") },
              { key: "fullName", label: t("panelSaas.demo.col.fullName") },
              { key: "phone", label: t("panelSaas.demo.col.phone") },
              { key: "email", label: t("panelSaas.demo.col.email") },
              { key: "city", label: t("panelSaas.demo.col.city") },
              { key: "institutionType", label: t("panelSaas.demo.col.institutionType") },
              { key: "studentCount", label: t("panelSaas.demo.col.studentCount") },
              { key: "status", label: t("panelSaas.demo.col.status") },
              { key: "assignedTo", label: t("panelSaas.demo.col.assignedTo") },
              { key: "message", label: t("panelSaas.demo.col.message") },
            ]}
            rows={items as unknown as Record<string, unknown>[]}
          />
        )}
      </div>

      {notice && (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-300">
          <CheckCircle2 size={16} aria-hidden="true" /> {notice}
        </p>
      )}
      {error && (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted">{t("panelSaas.demo.empty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((r) => (
            <DemoRow
              key={r.id}
              record={r}
              schools={schools}
              open={openId === r.id}
              busy={busyId === r.id}
              onToggle={() => setOpenId(openId === r.id ? null : r.id)}
              onStatus={(s) => handleStatus(r.id, s)}
              onSave={(note, assignedTo) =>
                handleSaveDetail(r.id, note, assignedTo)
              }
              onConvert={(tenantId) => handleConvert(r, tenantId)}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

const STATUS_TONES: Record<string, string> = {
  new: "border-accent/20 bg-accent/10 text-accent",
  contacted: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  demo_booked: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  converted: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  lost: "border-overlay/15 bg-overlay/5 text-muted",
};

function DemoRow({
  record,
  schools,
  open,
  busy,
  onToggle,
  onStatus,
  onSave,
  onConvert,
}: {
  record: DemoRequestRecord;
  schools: SchoolRecord[];
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onStatus: (status: DemoStatus) => void;
  onSave: (notes: string, assignedTo: string) => void;
  onConvert: (tenantId: string) => void;
}) {
  const t = useT();
  const [notes, setNotes] = useState(record.notes);
  const [assignedTo, setAssignedTo] = useState(record.assignedTo);
  const [tenantId, setTenantId] = useState(record.leadTenantId);
  const converted =
    record.status === "converted" || Boolean(record.convertedToLeadId);

  return (
    <div className="rounded-xl border border-overlay/10 bg-overlay/[0.02]">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block truncate font-medium text-content">
              {record.institution || "—"}
            </span>
            <span className="block truncate text-xs text-muted">
              {record.fullName} · {record.phone || record.email || "—"}
              {record.city ? ` · ${record.city}` : ""}
            </span>
          </span>
        </button>

        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            STATUS_TONES[record.status] ?? STATUS_TONES.new
          }`}
        >
          {demoStatusLabel(record.status)}
        </span>

        <select
          value={record.status}
          disabled={busy}
          onChange={(e) => onStatus(e.target.value as DemoStatus)}
          className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
          aria-label={t("panelSaas.demo.statusAria")}
        >
          {DEMO_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-surface">
              {demoStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {open && (
        <div className="border-t border-overlay/10 px-4 py-4">
          {record.message && (
            <p className="mb-3 rounded-lg border border-overlay/10 bg-overlay/[0.02] px-3 py-2 text-sm text-muted">
              {record.message}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
              {t("panelSaas.demo.note")}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
              {t("panelSaas.demo.assignedToLabel")}
              <input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder={t("panelSaas.demo.assignedToPlaceholder")}
                className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <PrimaryButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => onSave(notes, assignedTo)}
            >
              <Save size={15} aria-hidden="true" /> {t("panelSaas.demo.save")}
            </PrimaryButton>

            <div className="ml-auto flex items-end gap-2">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
                {t("panelSaas.demo.leadTarget")}
                <select
                  value={tenantId}
                  disabled={busy || converted}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
                >
                  <option value="" className="bg-surface">
                    {t("panelSaas.demo.platformNoSchool")}
                  </option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id} className="bg-surface">
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <PrimaryButton
                type="button"
                size="sm"
                disabled={busy || converted}
                onClick={() => onConvert(tenantId)}
              >
                <ArrowRightCircle size={15} aria-hidden="true" />
                {converted ? t("panelSaas.demo.convertedToLead") : t("panelSaas.demo.convertToLead")}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
