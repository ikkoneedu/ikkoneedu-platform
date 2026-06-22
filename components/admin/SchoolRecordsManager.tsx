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
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listStudents,
  createStudent,
  deactivateStudent,
  assignStudentToClass,
  type StudentRecord,
} from "@/lib/services/students";
import {
  listParents,
  createParent,
  deactivateParent,
  linkParentToStudent,
  type ParentRecord,
} from "@/lib/services/parents";
import {
  listTeachers,
  createTeacher,
  deactivateTeacher,
  assignTeacherToClass,
  type TeacherRecord,
} from "@/lib/services/teachers";
import {
  listClasses,
  createClass,
  archiveClass,
  type SchoolClass,
} from "@/lib/services/classes";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

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
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const schoolId = profile?.schoolId ?? tenantId ?? "";
  const canManage = profile != null && MANAGER_ROLES.includes(profile.role);
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
                            onChange={(e) =>
                              void run(() =>
                                assignStudentToClass(tenantId, s.id, e.target.value),
                              )
                            }
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
                            aria-label="Sınıf ata"
                          >
                            <option value="" className="bg-surface">Sınıf seç…</option>
                            {activeClasses.map((c) => (
                              <option key={c.id} value={c.id} className="bg-surface">
                                {c.name}
                              </option>
                            ))}
                          </select>
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
    </div>
  );
}
