"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  ClipboardList,
  Plus,
  RefreshCw,
  AlertCircle,
  X,
  CalendarPlus,
  UserCheck,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listTenantUsers, type TenantUser } from "@/lib/services/users";
import { listLeads, type LeadRecord } from "@/lib/services/leads";
import {
  listScholarshipApplications,
  type ScholarshipApplicationRecord,
} from "@/lib/services/scholarship-applications";
import { createStudent } from "@/lib/services/students";
import { createParent, getParent } from "@/lib/services/parents";
import { linkParentToStudent } from "@/lib/services/parents";
import { createUserNotification } from "@/lib/services/notifications";
import {
  provisionParentAccount,
  type ProvisionResult,
} from "@/lib/services/account-provisioning";
import {
  listAdmissions,
  createAdmission,
  updateAdmissionStatus,
  updateAdmission,
  assignAdmission,
  addAdmissionNote,
  scheduleAdmissionMeeting,
  listAdmissionMeetings,
  updateAdmissionMeetingStatus,
  markAdmissionRegistered,
  createAdmissionFromLead,
  createAdmissionFromScholarship,
  admissionStatusLabel,
  priorityLabel,
  sourceLabel,
  meetingTypeLabel,
  meetingStatusLabel,
  ADMISSION_STATUSES,
  ADMISSION_PRIORITIES,
  ADMISSION_SOURCES,
  MEETING_TYPES,
  MEETING_STATUSES,
  type AdmissionRecord,
  type AdmissionMeetingRecord,
  type AdmissionStatus,
  type AdmissionPriority,
  type MeetingType,
  type MeetingStatus,
} from "@/lib/services/admissions";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const ACCESS_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SALES,
  ROLES.PR,
  ROLES.SUPER_ADMIN,
];

/** Kesin kayıt (öğrenci/veli oluşturma) yetkisi — SALES/PR HARİÇ (kurallar). */
const REGISTER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

const STATUS_TONES: Record<string, string> = {
  new: "border-accent/20 bg-accent/10 text-accent",
  contacted: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  meeting_scheduled: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  interview_done: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  offer_sent: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  registered: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  lost: "border-white/15 bg-white/5 text-muted",
};
const PRIORITY_TONES: Record<string, string> = {
  low: "border-white/15 bg-white/5 text-muted",
  normal: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  high: "border-brand/30 bg-brand/10 text-brand",
};

function fmt(ms: number | null): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

/** "Ad Soyad" → {first, last} (tek kelimeyse soyad "-"). */
function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "-", last: "-" };
  if (parts.length === 1) return { first: parts[0], last: "-" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/**
 * Kayıt Kabul Panosu — aday öğrenci operasyon akışı (gerçek Firestore, AI yok).
 * /admissions-ai sayfasının üstüne eklenir; mevcut mock içerik korunur.
 */
export function AdmissionsBoard() {
  const { user, profile, firebaseReady } = useAuth();
  const uid = user?.uid ?? "";
  const tenantId = profile?.tenantId;
  const schoolId = profile?.schoolId ?? tenantId ?? "";
  const canAccess = profile != null && ACCESS_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canAccess;

  const [items, setItems] = useState<AdmissionRecord[] | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [scholar, setScholar] = useState<ScholarshipApplicationRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addMode, setAddMode] = useState<"manual" | "lead" | "scholarship">("manual");
  const [fStatus, setFStatus] = useState("all");
  const [fSource, setFSource] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");

  const [openId, setOpenId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<AdmissionMeetingRecord[]>([]);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    setError(null);
    try {
      const [a, u, l, s] = await Promise.all([
        listAdmissions(tenantId),
        listTenantUsers(tenantId),
        listLeads(tenantId),
        listScholarshipApplications(tenantId),
      ]);
      setItems(a);
      setUsers(u);
      setLeads(l);
      setScholar(s);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  const assignees = useMemo(
    () => users.filter((u) => ACCESS_ROLES.includes(u.role) && u.status === "ACTIVE"),
    [users],
  );
  const userName = useCallback(
    (id: string) => users.find((u) => u.uid === id)?.displayName || (id ? "—" : ""),
    [users],
  );

  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
      if (openId && tenantId) {
        try {
          setMeetings(await listAdmissionMeetings(tenantId, openId));
        } catch {
          /* görüşme listesi tazelenemese de akış sürer */
        }
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async (id: string) => {
    setOpenId(id);
    setMeetings([]);
    if (tenantId) {
      try {
        setMeetings(await listAdmissionMeetings(tenantId, id));
      } catch {
        /* görüşme listesi yüklenemese de detay açılır */
      }
    }
  };

  if (!usable) return null;

  const convertedLeadIds = new Set((items ?? []).map((a) => a.leadId).filter(Boolean));
  const convertedScholarNos = new Set(
    (items ?? []).map((a) => a.scholarshipApplicationNo).filter(Boolean),
  );
  const openLeads = leads.filter((l) => !convertedLeadIds.has(l.id));
  const openScholar = scholar.filter((s) => !convertedScholarNos.has(s.applicationNo));

  const visible = (items ?? []).filter(
    (a) =>
      (fStatus === "all" || a.status === fStatus) &&
      (fSource === "all" || a.source === fSource) &&
      (fPriority === "all" || a.priority === fPriority) &&
      (fAssignee === "all" || a.assignedTo === fAssignee),
  );

  const selected = (items ?? []).find((a) => a.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Aday Ekle */}
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ClipboardList size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Aday Ekle</h2>
          <div className="ml-auto flex items-center gap-1">
            {(["manual", "lead", "scholarship"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAddMode(m)}
                className={`rounded-lg px-2.5 py-1 text-xs transition ${
                  addMode === m
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-content"
                }`}
              >
                {m === "manual" ? "Manuel" : m === "lead" ? "CRM Lead" : "Bursluluk"}
              </button>
            ))}
          </div>
        </div>

        {addMode === "manual" && (
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const form = e.currentTarget;
              void run(async () => {
                await createAdmission(tenantId!, schoolId, {
                  source: "manual",
                  studentName: String(fd.get("studentName") ?? ""),
                  parentName: String(fd.get("parentName") ?? ""),
                  parentPhone: String(fd.get("parentPhone") ?? ""),
                  parentEmail: String(fd.get("parentEmail") ?? ""),
                  studentGrade: String(fd.get("studentGrade") ?? ""),
                  city: String(fd.get("city") ?? ""),
                });
                form.reset();
              });
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <TextField label="Öğrenci Adı *" name="studentName" required />
            <TextField label="Veli Adı *" name="parentName" required />
            <TextField label="Veli Telefon *" name="parentPhone" required />
            <TextField label="Veli E-posta" name="parentEmail" type="email" />
            <TextField label="Sınıf/Kademe" name="studentGrade" placeholder="1" />
            <TextField label="Şehir" name="city" />
            <div className="sm:col-span-3">
              <PrimaryButton type="submit" size="md" disabled={busy}>
                <Plus size={16} aria-hidden="true" /> Aday Oluştur
              </PrimaryButton>
            </div>
          </form>
        )}

        {addMode === "lead" && (
          <div>
            <p className="mb-2 text-xs text-muted">
              CRM lead&apos;lerinden adaya dönüştür (her lead bir kez).
            </p>
            {openLeads.length === 0 ? (
              <p className="text-sm text-muted">Dönüştürülecek CRM lead&apos;i yok.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {openLeads.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-medium text-content">{l.fullName || "—"}</span>
                      <span className="block text-xs text-muted">
                        {l.phone || l.email || "—"} {l.source ? `· ${l.source}` : ""}
                      </span>
                    </span>
                    <PrimaryButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() => void run(() => createAdmissionFromLead(tenantId!, schoolId, l))}
                    >
                      Adaya Aktar
                    </PrimaryButton>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {addMode === "scholarship" && (
          <div>
            <p className="mb-2 text-xs text-muted">
              Bursluluk başvurularından adaya dönüştür (her başvuru bir kez).
            </p>
            {openScholar.length === 0 ? (
              <p className="text-sm text-muted">Dönüştürülecek başvuru yok.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {openScholar.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-medium text-content">{s.studentName || "—"}</span>
                      <span className="block text-xs text-muted">
                        {s.applicationNo} · {s.parentName} · {s.parentPhone}
                      </span>
                    </span>
                    <PrimaryButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run(() => createAdmissionFromScholarship(tenantId!, schoolId, s))
                      }
                    >
                      Adaya Aktar
                    </PrimaryButton>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </GlassCard>

      {/* Liste + filtreler */}
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <UserCheck size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Adaylar</h2>
          <span className="text-xs text-muted">{visible.length}</span>
          {visible.length > 0 && (
            <DataExportButtons
              className="ml-auto"
              filename="adaylar"
              title="Adaylar"
              columns={[
                { key: "ogrenci", label: "Öğrenci" },
                { key: "veli", label: "Veli" },
                { key: "telefon", label: "Telefon" },
                { key: "sinif", label: "Sınıf" },
                { key: "kaynak", label: "Kaynak" },
                { key: "durum", label: "Durum" },
                { key: "oncelik", label: "Öncelik" },
                { key: "atanan", label: "Atanan" },
              ]}
              rows={visible.map((a) => ({
                ogrenci: a.studentName,
                veli: a.parentName,
                telefon: a.parentPhone,
                sinif: a.studentGrade,
                kaynak: sourceLabel(a.source),
                durum: admissionStatusLabel(a.status),
                oncelik: priorityLabel(a.priority),
                atanan: userName(a.assignedTo),
              }))}
            />
          )}
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className={`${visible.length > 0 ? "" : "ml-auto"} text-muted transition hover:text-content disabled:opacity-50`}
            aria-label="Yenile"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <FilterSelect label="Durum" value={fStatus} onChange={setFStatus}
            options={[["all", "Tümü"], ...ADMISSION_STATUSES.map((s) => [s, admissionStatusLabel(s)] as [string, string])]} />
          <FilterSelect label="Kaynak" value={fSource} onChange={setFSource}
            options={[["all", "Tümü"], ...ADMISSION_SOURCES.map((s) => [s, sourceLabel(s)] as [string, string])]} />
          <FilterSelect label="Öncelik" value={fPriority} onChange={setFPriority}
            options={[["all", "Tümü"], ...ADMISSION_PRIORITIES.map((s) => [s, priorityLabel(s)] as [string, string])]} />
          <FilterSelect label="Atanan" value={fAssignee} onChange={setFAssignee}
            options={[["all", "Tümü"], ...assignees.map((u) => [u.uid, u.displayName || u.email] as [string, string])]} />
        </div>

        {items === null ? (
          <p className="text-sm text-muted">Yükleniyor…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted">Aday yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-3 font-medium">Öğrenci / Veli</th>
                  <th className="pb-2 pr-3 font-medium">Telefon</th>
                  <th className="pb-2 pr-3 font-medium">Sınıf</th>
                  <th className="pb-2 pr-3 font-medium">Kaynak</th>
                  <th className="pb-2 pr-3 font-medium">Durum</th>
                  <th className="pb-2 pr-3 font-medium">Öncelik</th>
                  <th className="pb-2 pr-3 font-medium">Atanan</th>
                  <th className="pb-2 font-medium">Güncelleme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visible.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => void openDetail(a.id)}
                    className="cursor-pointer text-content transition hover:bg-white/[0.03]"
                  >
                    <td className="py-2.5 pr-3">
                      <span className="font-medium">{a.studentName}</span>
                      <span className="block text-xs text-muted">{a.parentName}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{a.parentPhone}</td>
                    <td className="py-2.5 pr-3 text-muted">{a.studentGrade || "—"}</td>
                    <td className="py-2.5 pr-3 text-muted">{sourceLabel(a.source)}</td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={STATUS_TONES[a.status]} text={admissionStatusLabel(a.status)} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={PRIORITY_TONES[a.priority]} text={priorityLabel(a.priority)} />
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{userName(a.assignedTo) || "—"}</td>
                    <td className="py-2.5 text-xs text-muted">{fmt(a.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </p>
        )}
      </GlassCard>

      {/* Detay modalı */}
      {selected && (
        <AdmissionDetail
          admission={selected}
          meetings={meetings}
          assignees={assignees}
          userName={userName}
          busy={busy}
          tenantId={tenantId!}
          schoolId={schoolId}
          authorName={profile?.displayName || "Kullanıcı"}
          canRegister={profile != null && REGISTER_ROLES.includes(profile.role)}
          onClose={() => setOpenId(null)}
          run={run}
          uid={uid}
          getIdToken={() => user!.getIdToken()}
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm text-content outline-none focus:border-accent"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-surface">{l}</option>
        ))}
      </select>
    </label>
  );
}

function Badge({ tone, text }: { tone?: string; text: string }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        tone ?? "border-white/15 bg-white/5 text-muted"
      }`}
    >
      {text}
    </span>
  );
}

function AdmissionDetail({
  admission,
  meetings,
  assignees,
  userName,
  busy,
  tenantId,
  schoolId,
  authorName,
  canRegister,
  onClose,
  run,
  uid,
  getIdToken,
}: {
  admission: AdmissionRecord;
  meetings: AdmissionMeetingRecord[];
  assignees: TenantUser[];
  userName: (id: string) => string;
  busy: boolean;
  tenantId: string;
  schoolId: string;
  authorName: string;
  canRegister: boolean;
  onClose: () => void;
  run: (fn: () => Promise<unknown>) => Promise<void>;
  uid: string;
  getIdToken: () => Promise<string>;
}) {
  const a = admission;
  const [note, setNote] = useState("");
  const [acctResult, setAcctResult] = useState<ProvisionResult | null>(null);
  const registered = Boolean(a.registeredStudentId);

  const createParentLogin = () =>
    run(async () => {
      const parent = await getParent(tenantId, a.registeredParentId);
      if (!parent) throw new Error("Veli kaydı bulunamadı.");
      const res = await provisionParentAccount(
        tenantId,
        schoolId,
        parent,
        a.parentEmail,
        await getIdToken(),
      );
      if (!res.ok) throw new Error(res.error ?? "Giriş hesabı oluşturulamadı.");
      setAcctResult(res);
    });

  const doRegister = () =>
    run(async () => {
      const sName = splitName(a.studentName);
      const pName = splitName(a.parentName);
      const studentId = await createStudent(tenantId, schoolId, {
        firstName: sName.first,
        lastName: sName.last,
        grade: a.studentGrade,
      });
      const parentId = await createParent(tenantId, schoolId, {
        firstName: pName.first,
        lastName: pName.last,
        phone: a.parentPhone,
        email: a.parentEmail,
      });
      await linkParentToStudent(tenantId, parentId, studentId);
      await markAdmissionRegistered(tenantId, a.id, studentId, parentId);
    });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
      <div className="my-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <UserCheck size={18} className="text-accent" aria-hidden="true" />
          <h3 className="text-base font-semibold text-content">{a.studentName}</h3>
          <span className="text-xs text-muted">· {sourceLabel(a.source)}</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-muted transition hover:text-content"
            aria-label="Kapat"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Bilgi + durum/öncelik/atanan */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
            <p className="text-muted">
              Veli: <span className="text-content">{a.parentName}</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-muted">
              <Phone size={12} aria-hidden="true" />
              <span className="text-content">{a.parentPhone}</span>
              {a.parentEmail ? <span className="text-content">· {a.parentEmail}</span> : null}
            </p>
            <p className="mt-0.5 text-muted">
              Sınıf: <span className="text-content">{a.studentGrade || "—"}</span>
              {a.currentSchool ? ` · ${a.currentSchool}` : ""}
            </p>
            {(a.city || a.district) && (
              <p className="mt-0.5 text-muted">
                {a.city} {a.district ? `/ ${a.district}` : ""}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-xs text-muted">
              Durum
              <select
                value={a.status}
                disabled={busy}
                onChange={(e) =>
                  void run(() => updateAdmissionStatus(tenantId, a.id, e.target.value as AdmissionStatus))
                }
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm text-content outline-none focus:border-accent"
              >
                {ADMISSION_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-surface">{admissionStatusLabel(s)}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-muted">
                Öncelik
                <select
                  value={a.priority}
                  disabled={busy}
                  onChange={(e) =>
                    void run(() => updateAdmission(tenantId, a.id, { priority: e.target.value as AdmissionPriority }))
                  }
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm text-content outline-none focus:border-accent"
                >
                  {ADMISSION_PRIORITIES.map((s) => (
                    <option key={s} value={s} className="bg-surface">{priorityLabel(s)}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                Atanan
                <select
                  value={a.assignedTo}
                  disabled={busy}
                  onChange={(e) => {
                    const assignee = e.target.value;
                    void run(async () => {
                      await assignAdmission(tenantId, a.id, assignee);
                      // Atanana uygulama içi bildirim (FCM yok).
                      if (assignee && assignee !== a.assignedTo) {
                        await createUserNotification(tenantId, {
                          userId: assignee,
                          title: `Aday atandı: ${a.studentName}`,
                          body: `${a.parentName} · ${a.parentPhone}`,
                          type: "crm",
                          link: "/admissions-ai",
                        });
                      }
                    });
                  }}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm text-content outline-none focus:border-accent"
                >
                  <option value="" className="bg-surface">—</option>
                  {assignees.map((u) => (
                    <option key={u.uid} value={u.uid} className="bg-surface">
                      {u.displayName || u.email}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Notlar */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Notlar</p>
          {a.notes.length > 0 && (
            <ul className="mb-2 flex flex-col gap-1">
              {a.notes
                .slice()
                .sort((x, y) => y.at - x.at)
                .map((n, i) => (
                  <li key={i} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-sm">
                    <span className="text-content">{n.text}</span>
                    <span className="ml-2 text-xs text-muted">
                      {n.author} · {fmt(n.at)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Not ekle…"
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
            />
            <PrimaryButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy || !note.trim()}
              onClick={() =>
                void run(async () => {
                  await addAdmissionNote(tenantId, a.id, note, authorName);
                  setNote("");
                })
              }
            >
              Ekle
            </PrimaryButton>
          </div>
        </div>

        {/* Görüşme planla + geçmiş */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Görüşmeler</p>
          {meetings.length > 0 && (
            <ul className="mb-2 flex flex-col gap-1">
              {meetings.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-sm"
                >
                  <span className="text-content">{m.meetingDate}</span>
                  <span className="text-xs text-muted">{meetingTypeLabel(m.meetingType)}</span>
                  {m.assignedTo && (
                    <span className="text-xs text-muted">· {userName(m.assignedTo)}</span>
                  )}
                  <select
                    value={m.status}
                    disabled={busy}
                    onChange={(e) =>
                      void run(() =>
                        updateAdmissionMeetingStatus(tenantId, m.id, e.target.value as MeetingStatus),
                      )
                    }
                    className="ml-auto rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-content outline-none focus:border-accent"
                  >
                    {MEETING_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-surface">{meetingStatusLabel(s)}</option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const form = e.currentTarget;
              const date = String(fd.get("meetingDate") ?? "");
              const type = String(fd.get("meetingType") ?? "phone") as MeetingType;
              const assignedTo = String(fd.get("assignedTo") ?? "") || uid;
              void run(async () => {
                await scheduleAdmissionMeeting(tenantId, schoolId, {
                  admissionId: a.id,
                  title: "Aday görüşmesi",
                  parentName: a.parentName,
                  parentPhone: a.parentPhone,
                  meetingDate: date,
                  meetingType: type,
                  assignedTo,
                });
                form.reset();
              });
            }}
            className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-end"
          >
            <label className="flex flex-col gap-1 text-xs text-muted">
              Tarih/Saat
              <input
                name="meetingDate"
                type="datetime-local"
                required
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm text-content outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              Tür
              <select name="meetingType" className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm text-content outline-none focus:border-accent">
                {MEETING_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-surface">{meetingTypeLabel(t)}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              Atanan
              <select name="assignedTo" defaultValue={a.assignedTo} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm text-content outline-none focus:border-accent">
                <option value="" className="bg-surface">Ben</option>
                {assignees.map((u) => (
                  <option key={u.uid} value={u.uid} className="bg-surface">{u.displayName || u.email}</option>
                ))}
              </select>
            </label>
            <PrimaryButton type="submit" size="sm" disabled={busy}>
              <CalendarPlus size={15} aria-hidden="true" /> Görüşme Planla
            </PrimaryButton>
          </form>
        </div>

        {/* Kesin kayıt */}
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
          {registered ? (
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 size={16} aria-hidden="true" />
                Kesin kayıt yapıldı (öğrenci ve veli kaydı oluşturuldu).
              </p>
              {acctResult?.ok ? (
                <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                  <span className="text-muted">Veli girişi: </span>
                  <span className="font-mono text-content">{acctResult.email}</span>
                  {acctResult.tempPassword && (
                    <>
                      <span className="text-muted"> · geçici şifre: </span>
                      <span className="font-mono text-accent">{acctResult.tempPassword}</span>
                      <span className="ml-1 block text-xs text-amber-300">
                        Bu şifre yalnız şimdi gösterilir, saklanmaz.
                      </span>
                    </>
                  )}
                  {acctResult.mode === "linked" && (
                    <span className="text-xs text-muted"> (mevcut hesap bağlandı)</span>
                  )}
                </p>
              ) : (
                canRegister &&
                a.parentEmail && (
                  <div>
                    <PrimaryButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() => void createParentLogin()}
                    >
                      <UserCheck size={15} aria-hidden="true" /> Veli Giriş Hesabı Oluştur
                    </PrimaryButton>
                  </div>
                )
              )}
            </div>
          ) : canRegister ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="flex-1 text-sm text-muted">
                Aday kesin kayda hazırsa öğrenci + veli kaydını oluşturun. Otomatik
                değildir; onayınızla yapılır.
              </p>
              <PrimaryButton type="button" size="sm" disabled={busy} onClick={() => void doRegister()}>
                <UserCheck size={15} aria-hidden="true" /> Öğrenci/Veli Oluştur
              </PrimaryButton>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Kesin kayıt (öğrenci/veli oluşturma) için okul yönetimi yetkisi gerekir.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <PrimaryButton type="button" variant="secondary" size="sm" onClick={onClose}>
            Kapat
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
