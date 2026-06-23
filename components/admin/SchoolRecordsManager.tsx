"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  School,
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  UserMinus,
  Archive,
  KeyRound,
  Copy,
  X,
  CheckCircle2,
  Pencil,
  Save,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listStudents,
  createStudent,
  updateStudent,
  deactivateStudent,
  assignStudentToClass,
  removeStudentFromClass,
  type StudentRecord,
} from "@/lib/services/students";
import {
  listParents,
  createParent,
  updateParent,
  deactivateParent,
  linkParentToStudent,
  unlinkParentFromStudent,
  type ParentRecord,
} from "@/lib/services/parents";
import {
  listTeachers,
  createTeacher,
  updateTeacher,
  deactivateTeacher,
  assignTeacherToClass,
  removeTeacherFromClass,
  type TeacherRecord,
} from "@/lib/services/teachers";
import {
  listClasses,
  createClass,
  updateClass,
  archiveClass,
  type SchoolClass,
} from "@/lib/services/classes";
import {
  provisionParentAccount,
  provisionTeacherAccount,
  provisionStudentAccount,
  type ProvisionResult,
} from "@/lib/services/account-provisioning";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

/** Giriş hesabı oluşturma yetkisi (kurallar TEACHER create + link için isSchoolManager ister). */
const ACCOUNT_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.SUPER_ADMIN,
];

type AccountKind = "parent" | "teacher" | "student";
interface AccountTarget {
  kind: AccountKind;
  id: string;
  name: string;
  defaultEmail: string;
}

type Tab = "students" | "parents" | "teachers" | "classes";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "students", label: "Öğrenciler", icon: GraduationCap },
  { id: "parents", label: "Veliler", icon: Users },
  { id: "teachers", label: "Öğretmenler", icon: BookOpen },
  { id: "classes", label: "Sınıflar", icon: School },
];

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-white/15 bg-white/5 text-muted"
      }`}
    >
      {active ? "Aktif" : status === "archived" ? "Arşiv" : "Pasif"}
    </span>
  );
}

/**
 * Okul Kayıt Yönetimi — öğrenci/veli/öğretmen/sınıf (gerçek Firestore).
 * Yalnızca okul yönetimi rolleri + Firebase aktifken. İlişkiler iki taraflı
 * (servis katmanı batch ile tutar). Soft delete.
 */
export function SchoolRecordsManager() {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const schoolId = profile?.schoolId ?? tenantId ?? "";
  const canManage = profile != null && MANAGER_ROLES.includes(profile.role);
  const canCreateAccounts = profile != null && ACCOUNT_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canManage;

  const [tab, setTab] = useState<Tab>("students");
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Giriş hesabı oluşturma modalı.
  const [acctTarget, setAcctTarget] = useState<AccountTarget | null>(null);
  const [acctEmail, setAcctEmail] = useState("");
  const [acctBusy, setAcctBusy] = useState(false);
  const [acctError, setAcctError] = useState<string | null>(null);
  const [acctResult, setAcctResult] = useState<ProvisionResult | null>(null);
  const [acctCopied, setAcctCopied] = useState(false);

  // Kayıt düzenleme modalı.
  const [edit, setEdit] = useState<{
    kind: "student" | "parent" | "teacher" | "class";
    id: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    setError(null);
    try {
      const [s, p, t, c] = await Promise.all([
        listStudents(tenantId),
        listParents(tenantId),
        listTeachers(tenantId),
        listClasses(tenantId),
      ]);
      setStudents(s);
      setParents(p);
      setTeachers(t);
      setClasses(c);
      setLoaded(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void refresh();
  }, [usable, refresh]);

  const activeClasses = useMemo(
    () => classes.filter((c) => c.status !== "archived"),
    [classes],
  );
  const className = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? "—";

  const openAccount = (t: AccountTarget) => {
    setAcctTarget(t);
    setAcctEmail(t.defaultEmail);
    setAcctError(null);
    setAcctResult(null);
    setAcctCopied(false);
  };
  const closeAccount = () => {
    setAcctTarget(null);
    setAcctResult(null);
    setAcctError(null);
    setAcctEmail("");
  };
  const submitAccount = async () => {
    if (!tenantId || !acctTarget || !user || acctBusy) return;
    setAcctBusy(true);
    setAcctError(null);
    try {
      const idToken = await user.getIdToken();
      let res: ProvisionResult;
      if (acctTarget.kind === "parent") {
        const rec = parents.find((p) => p.id === acctTarget.id);
        if (!rec) throw new Error("Kayıt bulunamadı.");
        res = await provisionParentAccount(tenantId, schoolId, rec, acctEmail, idToken);
      } else if (acctTarget.kind === "teacher") {
        const rec = teachers.find((t) => t.id === acctTarget.id);
        if (!rec) throw new Error("Kayıt bulunamadı.");
        res = await provisionTeacherAccount(tenantId, schoolId, rec, acctEmail, idToken);
      } else {
        const rec = students.find((s) => s.id === acctTarget.id);
        if (!rec) throw new Error("Kayıt bulunamadı.");
        res = await provisionStudentAccount(tenantId, schoolId, rec, acctEmail, idToken);
      }
      if (!res.ok) {
        setAcctError(res.error ?? "Hesap oluşturulamadı.");
      } else {
        setAcctResult(res);
        await refresh();
      }
    } catch (err) {
      setAcctError(getAuthErrorMessage(err));
    } finally {
      setAcctBusy(false);
    }
  };

  const saveEdit = (patch: Record<string, string>) =>
    run(async () => {
      if (!edit || !tenantId) return;
      if (edit.kind === "student") {
        await updateStudent(tenantId, edit.id, {
          firstName: patch.firstName,
          lastName: patch.lastName,
          studentNo: patch.studentNo,
          grade: patch.grade,
        });
      } else if (edit.kind === "parent") {
        await updateParent(tenantId, edit.id, {
          firstName: patch.firstName,
          lastName: patch.lastName,
          phone: patch.phone,
          email: patch.email,
        });
      } else if (edit.kind === "teacher") {
        await updateTeacher(tenantId, edit.id, {
          firstName: patch.firstName,
          lastName: patch.lastName,
          branch: patch.branch,
          phone: patch.phone,
          email: patch.email,
        });
      } else {
        await updateClass(tenantId, edit.id, { name: patch.name, grade: patch.grade });
      }
      setEdit(null);
    });

  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady) return null;
  if (!canManage) {
    return (
      <GlassCard tone="navy">
        <p className="text-sm text-muted">
          Bu bölümü yalnızca okul yöneticileri kullanabilir.
        </p>
      </GlassCard>
    );
  }
  if (!tenantId) return null;

  const q = search.trim().toLowerCase();
  const matchName = (s: string) => !q || s.toLowerCase().includes(q);

  const acctButton = (
    kind: AccountKind,
    id: string,
    name: string,
    email: string,
    userId: string,
  ) =>
    userId ? (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
        <KeyRound size={11} aria-hidden="true" /> Hesap Bağlı
      </span>
    ) : canCreateAccounts ? (
      <button
        type="button"
        onClick={() => openAccount({ kind, id, name, defaultEmail: email })}
        disabled={busy}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-2 py-1 text-xs text-accent transition hover:bg-accent/20 disabled:opacity-50"
      >
        <KeyRound size={13} aria-hidden="true" /> Giriş Hesabı
      </button>
    ) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Sekmeler */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          const count =
            t.id === "students"
              ? students.length
              : t.id === "parents"
                ? parents.length
                : t.id === "teachers"
                  ? teachers.length
                  : classes.length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSearch("");
              }}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                active
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-white/10 text-muted hover:text-content"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {t.label}
              <span className="text-xs opacity-70">{count}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
          aria-label="Yenile"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {/* Arama */}
      {tab !== "classes" && (
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-content outline-none focus:border-accent"
          />
        </div>
      )}

      {!loaded ? (
        <GlassCard tone="navy">
          <p className="text-sm text-muted">Yükleniyor…</p>
        </GlassCard>
      ) : (
        <>
          {/* ---- ÖĞRENCİLER ---- */}
          {tab === "students" && (
            <div className="flex flex-col gap-4">
              <GlassCard tone="navy">
                <h3 className="mb-3 text-sm font-semibold text-content">Öğrenci Ekle</h3>
                <form
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const form = e.currentTarget;
                    void run(async () => {
                      await createStudent(tenantId, schoolId, {
                        firstName: String(fd.get("firstName") ?? ""),
                        lastName: String(fd.get("lastName") ?? ""),
                        studentNo: String(fd.get("studentNo") ?? ""),
                        grade: String(fd.get("grade") ?? ""),
                      });
                      form.reset();
                    });
                  }}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-end"
                >
                  <TextField label="Ad" name="firstName" required />
                  <TextField label="Soyad" name="lastName" required />
                  <TextField label="Öğrenci No" name="studentNo" />
                  <TextField label="Kademe" name="grade" placeholder="1" />
                  <PrimaryButton type="submit" size="md" disabled={busy}>
                    <Plus size={16} aria-hidden="true" /> Ekle
                  </PrimaryButton>
                </form>
              </GlassCard>

              <GlassCard tone="navy">
                {students.filter((s) => matchName(s.fullName) || matchName(s.studentNo))
                  .length === 0 ? (
                  <p className="text-sm text-muted">Öğrenci yok.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {students
                      .filter((s) => matchName(s.fullName) || matchName(s.studentNo))
                      .map((s) => (
                        <li
                          key={s.id}
                          className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-content">
                              {s.fullName}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {s.studentNo ? `No: ${s.studentNo} · ` : ""}
                              {s.grade ? `${s.grade}. kademe · ` : ""}
                              {s.classId ? className(s.classId) : "sınıfsız"}
                            </span>
                          </span>
                          <StatusBadge status={s.status} />
                          <select
                            value={s.classId}
                            disabled={busy}
                            onChange={(e) => {
                              const cid = e.target.value;
                              void run(() =>
                                cid
                                  ? assignStudentToClass(tenantId, s.id, cid)
                                  : removeStudentFromClass(tenantId, s.id),
                              );
                            }}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
                            aria-label="Sınıf ata"
                          >
                            <option value="" className="bg-surface">Sınıfsız</option>
                            {activeClasses.map((c) => (
                              <option key={c.id} value={c.id} className="bg-surface">
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <EditButton onClick={() => setEdit({ kind: "student", id: s.id })} />
                          {acctButton("student", s.id, s.fullName, "", s.userId)}
                          {s.status === "active" && (
                            <button
                              type="button"
                              onClick={() => void run(() => deactivateStudent(tenantId, s.id))}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-2 py-1 text-xs text-brand transition hover:bg-brand/20 disabled:opacity-50"
                            >
                              <UserMinus size={13} aria-hidden="true" /> Pasifleştir
                            </button>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </GlassCard>
            </div>
          )}

          {/* ---- VELİLER ---- */}
          {tab === "parents" && (
            <div className="flex flex-col gap-4">
              <GlassCard tone="navy">
                <h3 className="mb-3 text-sm font-semibold text-content">Veli Ekle</h3>
                <form
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const form = e.currentTarget;
                    void run(async () => {
                      await createParent(tenantId, schoolId, {
                        firstName: String(fd.get("firstName") ?? ""),
                        lastName: String(fd.get("lastName") ?? ""),
                        phone: String(fd.get("phone") ?? ""),
                        email: String(fd.get("email") ?? ""),
                      });
                      form.reset();
                    });
                  }}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-end"
                >
                  <TextField label="Ad" name="firstName" required />
                  <TextField label="Soyad" name="lastName" required />
                  <TextField label="Telefon" name="phone" />
                  <TextField label="E-posta" name="email" type="email" />
                  <PrimaryButton type="submit" size="md" disabled={busy}>
                    <Plus size={16} aria-hidden="true" /> Ekle
                  </PrimaryButton>
                </form>
              </GlassCard>

              <GlassCard tone="navy">
                {parents.filter((p) => matchName(p.fullName)).length === 0 ? (
                  <p className="text-sm text-muted">Veli yok.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {parents
                      .filter((p) => matchName(p.fullName))
                      .map((p) => (
                        <li
                          key={p.id}
                          className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-content">
                              {p.fullName}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {p.phone || p.email || "—"} · {p.linkedStudentIds.length} öğrenci
                            </span>
                          </span>
                          <StatusBadge status={p.status} />
                          <select
                            value=""
                            disabled={busy}
                            onChange={(e) => {
                              const sid = e.target.value;
                              if (sid) void run(() => linkParentToStudent(tenantId, p.id, sid));
                            }}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
                            aria-label="Öğrenci bağla"
                          >
                            <option value="" className="bg-surface">Öğrenci bağla…</option>
                            {students
                              .filter((s) => !p.linkedStudentIds.includes(s.id))
                              .map((s) => (
                                <option key={s.id} value={s.id} className="bg-surface">
                                  {s.fullName}
                                </option>
                              ))}
                          </select>
                          <EditButton onClick={() => setEdit({ kind: "parent", id: p.id })} />
                          {acctButton("parent", p.id, p.fullName, p.email, p.userId)}
                          {p.status === "active" && (
                            <button
                              type="button"
                              onClick={() => void run(() => deactivateParent(tenantId, p.id))}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-2 py-1 text-xs text-brand transition hover:bg-brand/20 disabled:opacity-50"
                            >
                              <UserMinus size={13} aria-hidden="true" /> Pasifleştir
                            </button>
                          )}
                          {p.linkedStudentIds.length > 0 && (
                            <div className="flex w-full flex-wrap gap-1.5">
                              {p.linkedStudentIds.map((sid) => (
                                <span
                                  key={sid}
                                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs text-muted"
                                >
                                  {students.find((s) => s.id === sid)?.fullName || sid}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void run(() => unlinkParentFromStudent(tenantId, p.id, sid))
                                    }
                                    disabled={busy}
                                    aria-label="Bağı kaldır"
                                    className="text-muted transition hover:text-brand"
                                  >
                                    <X size={11} aria-hidden="true" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </GlassCard>
            </div>
          )}

          {/* ---- ÖĞRETMENLER ---- */}
          {tab === "teachers" && (
            <div className="flex flex-col gap-4">
              <GlassCard tone="navy">
                <h3 className="mb-3 text-sm font-semibold text-content">Öğretmen Ekle</h3>
                <form
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const form = e.currentTarget;
                    void run(async () => {
                      await createTeacher(tenantId, schoolId, {
                        firstName: String(fd.get("firstName") ?? ""),
                        lastName: String(fd.get("lastName") ?? ""),
                        phone: String(fd.get("phone") ?? ""),
                        email: String(fd.get("email") ?? ""),
                        branch: String(fd.get("branch") ?? ""),
                      });
                      form.reset();
                    });
                  }}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-6 sm:items-end"
                >
                  <TextField label="Ad" name="firstName" required />
                  <TextField label="Soyad" name="lastName" required />
                  <TextField label="Branş" name="branch" placeholder="Matematik" />
                  <TextField label="Telefon" name="phone" />
                  <TextField label="E-posta" name="email" type="email" />
                  <PrimaryButton type="submit" size="md" disabled={busy}>
                    <Plus size={16} aria-hidden="true" /> Ekle
                  </PrimaryButton>
                </form>
              </GlassCard>

              <GlassCard tone="navy">
                {teachers.filter((t) => matchName(t.fullName) || matchName(t.branch))
                  .length === 0 ? (
                  <p className="text-sm text-muted">Öğretmen yok.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {teachers
                      .filter((t) => matchName(t.fullName) || matchName(t.branch))
                      .map((t) => (
                        <li
                          key={t.id}
                          className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-content">
                              {t.fullName}
                            </span>
                            <span className="block truncate text-xs text-muted">
                              {t.branch ? `${t.branch} · ` : ""}
                              {t.phone || t.email || "—"} · {t.classIds.length} sınıf
                            </span>
                          </span>
                          <StatusBadge status={t.status} />
                          <select
                            value=""
                            disabled={busy}
                            onChange={(e) => {
                              const cid = e.target.value;
                              if (cid) void run(() => assignTeacherToClass(tenantId, t.id, cid));
                            }}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
                            aria-label="Sınıfa ata"
                          >
                            <option value="" className="bg-surface">Sınıfa ata…</option>
                            {activeClasses
                              .filter((c) => !t.classIds.includes(c.id))
                              .map((c) => (
                                <option key={c.id} value={c.id} className="bg-surface">
                                  {c.name}
                                </option>
                              ))}
                          </select>
                          <EditButton onClick={() => setEdit({ kind: "teacher", id: t.id })} />
                          {acctButton("teacher", t.id, t.fullName, t.email, t.userId)}
                          {t.status === "active" && (
                            <button
                              type="button"
                              onClick={() => void run(() => deactivateTeacher(tenantId, t.id))}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-2 py-1 text-xs text-brand transition hover:bg-brand/20 disabled:opacity-50"
                            >
                              <UserMinus size={13} aria-hidden="true" /> Pasifleştir
                            </button>
                          )}
                          {t.classIds.length > 0 && (
                            <div className="flex w-full flex-wrap gap-1.5">
                              {t.classIds.map((cid) => (
                                <span
                                  key={cid}
                                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs text-muted"
                                >
                                  {className(cid)}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void run(() => removeTeacherFromClass(tenantId, t.id, cid))
                                    }
                                    disabled={busy}
                                    aria-label="Sınıftan çıkar"
                                    className="text-muted transition hover:text-brand"
                                  >
                                    <X size={11} aria-hidden="true" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </GlassCard>
            </div>
          )}

          {/* ---- SINIFLAR ---- */}
          {tab === "classes" && (
            <div className="flex flex-col gap-4">
              <GlassCard tone="navy">
                <h3 className="mb-3 text-sm font-semibold text-content">Sınıf Oluştur</h3>
                <form
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const form = e.currentTarget;
                    void run(async () => {
                      await createClass(tenantId, schoolId, {
                        name: String(fd.get("name") ?? ""),
                        grade: String(fd.get("grade") ?? ""),
                      });
                      form.reset();
                    });
                  }}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end"
                >
                  <TextField label="Sınıf Adı" name="name" placeholder="1-A" required />
                  <TextField label="Kademe" name="grade" placeholder="1" />
                  <PrimaryButton type="submit" size="md" disabled={busy}>
                    <Plus size={16} aria-hidden="true" /> Oluştur
                  </PrimaryButton>
                </form>
                <p className="mt-2 text-xs text-muted">
                  Toplu şube üretimi için Ders Programı sayfasındaki Sınıf Yapısı
                  bölümünü de kullanabilirsiniz.
                </p>
              </GlassCard>

              <GlassCard tone="navy">
                {classes.length === 0 ? (
                  <p className="text-sm text-muted">Sınıf yok.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {classes.map((c) => (
                      <li
                        key={c.id}
                        className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-content">
                            {c.name}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {c.grade ? `${c.grade}. kademe · ` : ""}
                            <Users size={11} className="mr-0.5 inline" aria-hidden="true" />
                            {c.studentIds.length} öğrenci ·{" "}
                            <BookOpen size={11} className="mr-0.5 inline" aria-hidden="true" />
                            {c.teacherIds.length} öğretmen
                          </span>
                        </span>
                        <StatusBadge status={c.status} />
                        {c.status !== "archived" && (
                          <EditButton onClick={() => setEdit({ kind: "class", id: c.id })} />
                        )}
                        {c.status !== "archived" && (
                          <button
                            type="button"
                            onClick={() => void run(() => archiveClass(tenantId, c.id))}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-muted transition hover:text-content disabled:opacity-50"
                          >
                            <Archive size={13} aria-hidden="true" /> Arşivle
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </div>
          )}
        </>
      )}

      {/* Giriş hesabı oluşturma / sonuç modalı */}
      {acctTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound size={18} className="text-accent" aria-hidden="true" />
              <h3 className="text-base font-semibold text-content">
                Giriş Hesabı · {acctTarget.name}
              </h3>
              <button
                type="button"
                onClick={closeAccount}
                className="ml-auto text-muted transition hover:text-content"
                aria-label="Kapat"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {acctResult && acctResult.ok ? (
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5 text-sm text-emerald-300">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {acctResult.mode === "created"
                    ? "Hesap oluşturuldu."
                    : "Mevcut kullanıcı bu kayda bağlandı."}
                </p>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                  <p className="text-muted">
                    E-posta:{" "}
                    <span className="font-mono text-content">{acctResult.email}</span>
                  </p>
                  {acctResult.tempPassword && (
                    <p className="mt-1 flex items-center gap-2 text-muted">
                      Geçici şifre:{" "}
                      <span className="font-mono text-accent">
                        {acctResult.tempPassword}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(acctResult.tempPassword ?? "");
                            setAcctCopied(true);
                            setTimeout(() => setAcctCopied(false), 2000);
                          } catch {
                            setAcctCopied(false);
                          }
                        }}
                        className="text-muted transition hover:text-content"
                        aria-label="Şifreyi kopyala"
                      >
                        {acctCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      </button>
                    </p>
                  )}
                </div>
                {acctResult.tempPassword && (
                  <p className="text-xs text-amber-300">
                    Bu şifre yalnızca şimdi gösterilir ve hiçbir yere kaydedilmez.
                    Kullanıcıya iletin; ilk girişte değiştirmesi istenir.
                  </p>
                )}
                <PrimaryButton type="button" size="md" onClick={closeAccount}>
                  Tamam
                </PrimaryButton>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted">
                  {acctTarget.kind === "student"
                    ? "Öğrenci için bir giriş e-postası girin. Güçlü geçici şifre üretilecek."
                    : "Giriş e-postasını onaylayın. Güçlü geçici şifre üretilecek."}
                </p>
                <TextField
                  label="E-posta"
                  name="acctEmail"
                  type="email"
                  value={acctEmail}
                  onChange={(e) => setAcctEmail(e.target.value)}
                  placeholder="kullanici@okul.com"
                />
                {acctError && (
                  <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-3 py-2.5 text-sm text-brand">
                    <AlertCircle size={16} aria-hidden="true" /> {acctError}
                  </p>
                )}
                <div className="flex gap-2">
                  <PrimaryButton
                    type="button"
                    size="md"
                    onClick={() => void submitAccount()}
                    disabled={acctBusy}
                  >
                    <KeyRound size={16} aria-hidden="true" />
                    {acctBusy ? "Oluşturuluyor…" : "Hesabı Oluştur"}
                  </PrimaryButton>
                  <PrimaryButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={closeAccount}
                    disabled={acctBusy}
                  >
                    Vazgeç
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kayıt düzenleme modalı */}
      {edit && (
        <RecordEditModal
          kind={edit.kind}
          record={
            edit.kind === "student"
              ? students.find((s) => s.id === edit.id)
              : edit.kind === "parent"
                ? parents.find((p) => p.id === edit.id)
                : edit.kind === "teacher"
                  ? teachers.find((t) => t.id === edit.id)
                  : classes.find((c) => c.id === edit.id)
          }
          busy={busy}
          onClose={() => setEdit(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Düzenle"
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-muted transition hover:text-content"
    >
      <Pencil size={13} aria-hidden="true" /> Düzenle
    </button>
  );
}

interface AnyRecord {
  firstName?: string;
  lastName?: string;
  studentNo?: string;
  grade?: string;
  phone?: string;
  email?: string;
  branch?: string;
  name?: string;
}

function RecordEditModal({
  kind,
  record,
  busy,
  onClose,
  onSave,
}: {
  kind: "student" | "parent" | "teacher" | "class";
  record: AnyRecord | undefined;
  busy: boolean;
  onClose: () => void;
  onSave: (patch: Record<string, string>) => void;
}) {
  const [v, setV] = useState<Record<string, string>>(() => ({
    firstName: record?.firstName ?? "",
    lastName: record?.lastName ?? "",
    studentNo: record?.studentNo ?? "",
    grade: record?.grade ?? "",
    phone: record?.phone ?? "",
    email: record?.email ?? "",
    branch: record?.branch ?? "",
    name: record?.name ?? "",
  }));
  if (!record) return null;
  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));

  const titles: Record<string, string> = {
    student: "Öğrenci Düzenle",
    parent: "Veli Düzenle",
    teacher: "Öğretmen Düzenle",
    class: "Sınıf Düzenle",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <Pencil size={18} className="text-accent" aria-hidden="true" />
          <h3 className="text-base font-semibold text-content">{titles[kind]}</h3>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-muted transition hover:text-content"
            aria-label="Kapat"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {kind === "class" ? (
            <>
              <TextField label="Sınıf Adı" name="name" value={v.name} onChange={(e) => set("name", e.target.value)} />
              <TextField label="Kademe" name="grade" value={v.grade} onChange={(e) => set("grade", e.target.value)} />
            </>
          ) : (
            <>
              <TextField label="Ad" name="firstName" value={v.firstName} onChange={(e) => set("firstName", e.target.value)} />
              <TextField label="Soyad" name="lastName" value={v.lastName} onChange={(e) => set("lastName", e.target.value)} />
              {kind === "student" && (
                <>
                  <TextField label="Öğrenci No" name="studentNo" value={v.studentNo} onChange={(e) => set("studentNo", e.target.value)} />
                  <TextField label="Kademe" name="grade" value={v.grade} onChange={(e) => set("grade", e.target.value)} />
                </>
              )}
              {kind === "teacher" && (
                <TextField label="Branş" name="branch" value={v.branch} onChange={(e) => set("branch", e.target.value)} />
              )}
              {(kind === "parent" || kind === "teacher") && (
                <>
                  <TextField label="Telefon" name="phone" value={v.phone} onChange={(e) => set("phone", e.target.value)} />
                  <TextField label="E-posta" name="email" type="email" value={v.email} onChange={(e) => set("email", e.target.value)} />
                </>
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <PrimaryButton type="button" variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Vazgeç
          </PrimaryButton>
          <PrimaryButton type="button" size="sm" onClick={() => onSave(v)} disabled={busy}>
            <Save size={15} aria-hidden="true" /> Kaydet
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
