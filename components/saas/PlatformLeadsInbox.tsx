"use client";

import { useEffect, useState } from "react";
import {
  Target,
  ChevronDown,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import {
  listPlatformLeads,
  updatePlatformLead,
  leadStatusLabel,
  LEAD_STATUSES,
  type PlatformLeadRecord,
  type LeadStatus,
} from "@/lib/services/leads";
import { listSchools, type SchoolRecord } from "@/lib/services/schools";
import { createAdmissionFromPlatformLead } from "@/lib/services/admissions";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STATUS_TONES: Record<string, string> = {
  new: "border-accent/20 bg-accent/10 text-accent",
  contacted: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  meeting_scheduled: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  proposal_sent: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  won: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  lost: "border-white/15 bg-white/5 text-muted",
};

/**
 * Platform satış lead pipeline'ı (gerçek Firestore — kök `platformLeads`).
 * Demo talebinden "Lead'e Çevir" ile oluşan platform lead'leri burada izlenir:
 * durum güncelleme, not + atanan kişi. Yalnızca SUPER_ADMIN + Firebase aktifken.
 */
export function PlatformLeadsInbox() {
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;

  const [items, setItems] = useState<PlatformLeadRecord[] | null>(null);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady || !isSuper) return;
    let active = true;
    void (async () => {
      const [rows, sch] = await Promise.all([listPlatformLeads(), listSchools()]);
      if (!active) return;
      setItems(rows);
      setSchools(sch);
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, isSuper]);

  const handleConvert = async (record: PlatformLeadRecord, tenantId: string) => {
    if (!tenantId) {
      setError("Önce bir okul seçin.");
      return;
    }
    setBusyId(record.id);
    setError(null);
    setNotice(null);
    try {
      const admissionId = await createAdmissionFromPlatformLead(tenantId, tenantId, record);
      patchLocal(record.id, { convertedToAdmissionId: admissionId });
      setNotice(`Aday oluşturuldu (${tenantId}). Kayıt Kabul panosunda görünür.`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const patchLocal = (id: string, patch: Partial<PlatformLeadRecord>) =>
    setItems((prev) =>
      prev ? prev.map((r) => (r.id === id ? { ...r, ...patch } : r)) : prev,
    );

  const handleStatus = async (id: string, status: LeadStatus) => {
    setBusyId(id);
    setError(null);
    try {
      await updatePlatformLead(id, { status });
      patchLocal(id, { status });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleSave = async (id: string, notes: string, assignedTo: string) => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await updatePlatformLead(id, { notes, assignedTo });
      patchLocal(id, { notes, assignedTo });
      setNotice("Kaydedildi.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  // Lead henüz yokken paneli gizleme — demo dönüşümünden sonra dolacak.
  if (!firebaseReady || !isSuper || items === null) return null;
  if (items.length === 0) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Target size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">
          Platform Satış Lead&apos;leri (canlı)
        </h2>
        <span className="text-xs text-muted">{items.length}</span>
        <DataExportButtons
          className="ml-auto"
          filename="platform-leadler"
          title="Platform Satış Leadleri"
          columns={[
            { key: "contactName", label: "Yetkili" },
            { key: "institution", label: "Kurum" },
            { key: "phone", label: "Telefon" },
            { key: "email", label: "E-posta" },
            { key: "city", label: "Şehir" },
            { key: "institutionType", label: "Kurum Türü" },
            { key: "studentCount", label: "Öğrenci Sayısı" },
            { key: "status", label: "Durum" },
            { key: "assignedTo", label: "Atanan" },
            { key: "notes", label: "Not" },
          ]}
          rows={items as unknown as Record<string, unknown>[]}
        />
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

      <div className="flex flex-col gap-2">
        {items.map((r) => (
          <LeadRow
            key={r.id}
            record={r}
            schools={schools}
            open={openId === r.id}
            busy={busyId === r.id}
            onToggle={() => setOpenId(openId === r.id ? null : r.id)}
            onStatus={(s) => handleStatus(r.id, s)}
            onSave={(notes, assignedTo) => handleSave(r.id, notes, assignedTo)}
            onConvert={(tenantId) => handleConvert(r, tenantId)}
          />
        ))}
      </div>
    </GlassCard>
  );
}

function LeadRow({
  record,
  schools,
  open,
  busy,
  onToggle,
  onStatus,
  onSave,
  onConvert,
}: {
  record: PlatformLeadRecord;
  schools: SchoolRecord[];
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onStatus: (status: LeadStatus) => void;
  onSave: (notes: string, assignedTo: string) => void;
  onConvert: (tenantId: string) => void;
}) {
  const [notes, setNotes] = useState(record.notes);
  const [assignedTo, setAssignedTo] = useState(record.assignedTo);
  const [targetTenant, setTargetTenant] = useState("");
  const converted = Boolean(record.convertedToAdmissionId);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
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
              {record.institution || record.contactName || "—"}
            </span>
            <span className="block truncate text-xs text-muted">
              {record.contactName} · {record.phone || record.email || "—"}
              {record.city ? ` · ${record.city}` : ""}
            </span>
          </span>
        </button>

        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            STATUS_TONES[record.status] ?? STATUS_TONES.new
          }`}
        >
          {leadStatusLabel(record.status)}
        </span>

        <select
          value={record.status}
          disabled={busy}
          onChange={(e) => onStatus(e.target.value as LeadStatus)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
          aria-label="Lead durumu"
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-surface">
              {leadStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
              Not
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
              Atanan kişi (opsiyonel)
              <input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Ör. satış temsilcisi"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
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
              <Save size={15} aria-hidden="true" /> Kaydet
            </PrimaryButton>

            {/* Adaya aktar (okul seç → admission) */}
            <div className="ml-auto flex items-end gap-2">
              {converted ? (
                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-300">
                  <CheckCircle2 size={13} aria-hidden="true" /> Adaya aktarıldı
                </span>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-xs text-muted">
                    Okul
                    <select
                      value={targetTenant}
                      disabled={busy}
                      onChange={(e) => setTargetTenant(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-content outline-none focus:border-accent"
                    >
                      <option value="" className="bg-surface">Seçiniz…</option>
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
                    disabled={busy || !targetTenant}
                    onClick={() => onConvert(targetTenant)}
                  >
                    Adaya Aktar
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
