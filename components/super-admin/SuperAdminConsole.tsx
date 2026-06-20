"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  Plus,
  AlertCircle,
  Users,
  School,
  RefreshCw,
  Pencil,
  Trash2,
  Check,
  X,
  Copy,
  CheckCircle2,
  Inbox,
  UserPlus,
  FileClock,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasRole } from "@/components/auth/RoleGate";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/auth/role-constants";
import {
  listAllUsers,
  createManagedAccount,
  type AllUser,
} from "@/lib/services/users";
import {
  createSchool,
  deleteSchool,
  listSchools,
  toSlug,
  updateSchool,
  type SchoolRecord,
} from "@/lib/services/schools";
import {
  listDemoRequests,
  type DemoRequestRecord,
} from "@/lib/services/demo-requests";
import {
  createPlatformAuditLog,
  listPlatformAuditLogs,
  type PlatformAuditRecord,
} from "@/lib/services/audit-logs";
import { UserAdminActions } from "@/components/admin/UserAdminActions";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/** Süper admin her role atayabilir. */
const ALL_ASSIGNABLE_ROLES = Object.values(ROLES) as Role[];

/**
 * Süper Admin konsolu — platform geneli görünüm.
 *
 * - Okul (tenant) oluşturma.
 * - Tüm okulların listesi (okul başına kullanıcı sayısıyla).
 * - Tüm kullanıcıların rol bazlı dağılımı + son kayıtlar.
 *
 * Yalnızca SUPER_ADMIN erişebilir (Firestore kuralları da zorunlu kılar).
 */
export function SuperAdminConsole() {
  const { user, firebaseReady, loading } = useAuth();
  const isSuperAdmin = useHasRole([ROLES.SUPER_ADMIN]);
  const adminUid = user?.uid;
  const ready = firebaseReady && Boolean(adminUid) && isSuperAdmin;

  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [users, setUsers] = useState<AllUser[]>([]);
  const [demoRequests, setDemoRequests] = useState<DemoRequestRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<PlatformAuditRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Okul oluşturma formu (kontrollü — demo talebinden ön doldurma için).
  const [form, setForm] = useState({
    name: "",
    slug: "",
    city: "",
    founderName: "",
    founderEmail: "",
  });
  // Onboarding sonucu — kurucu hesabı geçici kimlik bilgileri.
  const [onboarded, setOnboarded] = useState<{
    school: string;
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const slugPreview = toSlug(form.slug || form.name);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, u, d, a] = await Promise.all([
        listSchools(),
        listAllUsers(),
        listDemoRequests(),
        listPlatformAuditLogs(),
      ]);
      setSchools(s);
      setUsers(u);
      setDemoRequests(d);
      setAuditLogs(a);
      setError(null);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  // Okul başına kullanıcı sayısı.
  const usersByTenant = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of users) {
      map.set(u.tenantId, (map.get(u.tenantId) ?? 0) + 1);
    }
    return map;
  }, [users]);

  // Rol bazlı dağılım.
  const roleCounts = useMemo(() => {
    const map = new Map<Role, number>();
    for (const u of users) {
      map.set(u.role, (map.get(u.role) ?? 0) + 1);
    }
    return map;
  }, [users]);

  // Best-effort platform denetim kaydı (hata UI'ı bozmaz).
  const logAction = useCallback(
    async (action: string, resource: string, meta: Record<string, unknown> = {}) => {
      try {
        await createPlatformAuditLog({ actorId: adminUid, action, resource, meta });
      } catch {
        /* denetim kaydı başarısız olsa da işlem akışını bozma */
      }
    },
    [adminUid],
  );

  const prefillFromDemo = (d: DemoRequestRecord) => {
    setForm({
      name: d.institution,
      slug: "",
      city: d.city,
      founderName: d.fullName,
      founderEmail: d.email,
    });
    setOnboarded(null);
    setError(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminUid || busy) return;
    const name = form.name.trim();
    const founderEmail = form.founderEmail.trim();
    const founderName = form.founderName.trim();
    if (!name) {
      setError("Lütfen okul adını girin.");
      return;
    }
    if (founderEmail && !founderEmail.includes("@")) {
      setError("Kurucu için geçerli bir e-posta girin (veya boş bırakın).");
      return;
    }

    setBusy(true);
    setError(null);
    setOnboarded(null);
    try {
      const school = await createSchool({
        name,
        slug: form.slug,
        city: form.city,
        createdBy: adminUid,
      });
      await logAction("school.create", `tenants/${school.id}`, { name: school.name });

      // Kurucu e-postası verildiyse okul için FOUNDER hesabı aç.
      if (founderEmail) {
        const result = await createManagedAccount({
          tenantId: school.id,
          createdBy: adminUid,
          role: ROLES.FOUNDER,
          displayName: founderName || name,
          email: founderEmail,
        });
        await logAction("founder.create", `users/${result.uid}`, {
          email: result.email,
          tenantId: school.id,
        });
        setOnboarded({
          school: school.name,
          email: result.email,
          password: result.tempPassword,
        });
      }

      setForm({ name: "", slug: "", city: "", founderName: "", founderEmail: "" });
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copyPassword = async () => {
    if (!onboarded) return;
    try {
      await navigator.clipboard.writeText(onboarded.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return <GlassCard tone="navy" className="text-sm text-muted">Yükleniyor…</GlassCard>;
  }

  if (!ready) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="text-sm text-muted">
          <p className="font-semibold text-content">Süper Admin konsolu kullanılamıyor</p>
          <p className="mt-1">
            Bu bölüm yalnızca giriş yapmış bir SUPER_ADMIN hesabıyla ve Firebase
            yapılandırması aktifken çalışır.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Global istatistikler */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<School size={18} />} label="Okul" value={schools.length} />
        <StatCard icon={<Users size={18} />} label="Toplam Kullanıcı" value={users.length} />
        <StatCard
          icon={<Users size={18} />}
          label={ROLE_LABELS.TEACHER}
          value={roleCounts.get(ROLES.TEACHER) ?? 0}
        />
        <StatCard
          icon={<Users size={18} />}
          label={ROLE_LABELS.STUDENT}
          value={roleCounts.get(ROLES.STUDENT) ?? 0}
        />
      </div>

      {/* Okul oluştur + kurucu onboarding */}
      <GlassCard tone="navy">
        <div className="mb-1 flex items-center gap-2">
          <Building2 size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Okul Oluştur</h2>
        </div>
        <p className="mb-4 text-xs text-muted">
          Kurucu e-postası girerseniz okul açılışıyla birlikte bir{" "}
          <span className="text-accent">Kurucu</span> hesabı oluşturulur ve geçici
          şifre üretilir.
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              label="Okul Adı"
              name="name"
              placeholder="Örnek Koleji"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Kısa Ad (slug)"
              name="slug"
              placeholder={slugPreview || "ornek-koleji"}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <TextField
              label="Şehir"
              name="city"
              placeholder="İstanbul"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <TextField
              label="Kurucu Ad Soyad (opsiyonel)"
              name="founderName"
              placeholder="Ad Soyad"
              value={form.founderName}
              onChange={(e) => setForm((f) => ({ ...f, founderName: e.target.value }))}
            />
            <TextField
              label="Kurucu E-posta (opsiyonel)"
              name="founderEmail"
              type="email"
              placeholder="kurucu@okul.com"
              value={form.founderEmail}
              onChange={(e) => setForm((f) => ({ ...f, founderEmail: e.target.value }))}
            />
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Plus size={16} aria-hidden="true" />
              {busy ? "Oluşturuluyor…" : "Okulu Oluştur"}
            </PrimaryButton>
          </div>
        </form>
        {slugPreview && !onboarded && (
          <p className="mt-2 text-xs text-muted">
            Kimlik: <span className="font-mono text-accent">{slugPreview}</span>
          </p>
        )}

        {onboarded && (
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-semibold text-content">
                Okul ve kurucu hesabı oluşturuldu
              </p>
              <p className="mt-0.5 text-muted">
                {onboarded.school} · Kurucu: {onboarded.email} · Geçici şifre:{" "}
                <span className="font-mono text-accent">{onboarded.password}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Bu bilgileri kurucuya iletin; e-posta + şifre ile /login üzerinden
                giriş yapacak.
              </p>
            </div>
            <PrimaryButton type="button" variant="secondary" size="sm" onClick={copyPassword}>
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? "Kopyalandı" : "Şifreyi Kopyala"}
            </PrimaryButton>
          </div>
        )}
      </GlassCard>

      {/* Demo talepleri — okula dönüştür */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Inbox size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Demo Talepleri</h2>
          <span className="ml-auto text-xs text-muted">{demoRequests.length} talep</span>
        </div>
        {demoRequests.length === 0 ? (
          <p className="text-sm text-muted">Bekleyen demo talebi yok.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {demoRequests.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-medium text-content">{d.institution || "—"}</span>
                  <p className="mt-0.5 text-xs text-muted">
                    {d.fullName || "—"} · {d.phone || d.email || "—"}
                    {d.city ? ` · ${d.city}` : ""}
                  </p>
                </div>
                <PrimaryButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => prefillFromDemo(d)}
                >
                  <UserPlus size={15} aria-hidden="true" />
                  Okula Dönüştür
                </PrimaryButton>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {/* Okullar */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <School size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Okullar</h2>
          <span className="ml-auto text-xs text-muted">{schools.length} okul</span>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="text-muted transition hover:text-content disabled:opacity-50"
            aria-label="Yenile"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
        {schools.length === 0 ? (
          <p className="text-sm text-muted">Henüz okul yok. Yukarıdan ilk okulu oluşturun.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4 font-medium">Okul</th>
                  <th className="pb-2 pr-4 font-medium">Kimlik</th>
                  <th className="pb-2 pr-4 font-medium">Şehir</th>
                  <th className="pb-2 pr-4 font-medium">Durum</th>
                  <th className="pb-2 pr-4 font-medium">Kullanıcı</th>
                  <th className="pb-2 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {schools.map((s) => (
                  <SchoolRow
                    key={s.id}
                    school={s}
                    userCount={usersByTenant.get(s.id) ?? 0}
                    onChanged={refresh}
                    onError={setError}
                    onAudit={logAction}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Tüm kullanıcılar */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Tüm Kullanıcılar</h2>
          <span className="ml-auto text-xs text-muted">{users.length} kayıt</span>
        </div>
        {users.length === 0 ? (
          <p className="text-sm text-muted">Henüz kullanıcı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4 font-medium">Ad</th>
                  <th className="pb-2 pr-4 font-medium">E-posta</th>
                  <th className="pb-2 pr-4 font-medium">Okul</th>
                  <th className="pb-2 pr-4 font-medium">Durum</th>
                  <th className="pb-2 font-medium">Rol / İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.uid} className="text-content">
                    <td className="py-2.5 pr-4">{u.displayName || "—"}</td>
                    <td className="py-2.5 pr-4 text-muted">{u.email}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted">{u.tenantId || "—"}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-2.5">
                      {u.uid === adminUid ? (
                        <span className="text-xs text-muted">{ROLE_LABELS[u.role] ?? u.role} (siz)</span>
                      ) : (
                        <UserAdminActions
                          uid={u.uid}
                          role={u.role}
                          status={u.status}
                          assignableRoles={ALL_ASSIGNABLE_ROLES}
                          onChanged={refresh}
                          onError={setError}
                          onAction={(action, meta) =>
                            logAction(action, `users/${u.uid}`, meta)
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* İşlem kayıtları (denetim) */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <FileClock size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">İşlem Kayıtları</h2>
          <span className="ml-auto text-xs text-muted">son {auditLogs.length}</span>
        </div>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-muted">Henüz kayıt yok.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {auditLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium text-content">{auditActionLabel(log.action)}</span>
                  {log.resource && (
                    <span className="ml-2 font-mono text-xs text-muted">{log.resource}</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted">{formatAuditTime(log.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  "school.create": "Okul oluşturuldu",
  "school.update": "Okul güncellendi",
  "school.delete": "Okul silindi",
  "founder.create": "Kurucu hesabı açıldı",
  "user.role_change": "Rol değiştirildi",
  "user.suspend": "Kullanıcı askıya alındı",
  "user.activate": "Kullanıcı etkinleştirildi",
};

function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

function formatAuditTime(ms: number | null): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function StatusBadge({ status }: { status: string }) {
  const suspended = status === "SUSPENDED";
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-xs",
        suspended
          ? "border-brand/30 bg-brand/10 text-brand"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
      ].join(" ")}
    >
      {suspended ? "Askıda" : status || "—"}
    </span>
  );
}

function SchoolRow({
  school,
  userCount,
  onChanged,
  onError,
  onAudit,
}: {
  school: SchoolRecord;
  userCount: number;
  onChanged: () => void | Promise<void>;
  onError: (message: string) => void;
  onAudit: (
    action: string,
    resource: string,
    meta?: Record<string, unknown>,
  ) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(school.name);
  const [city, setCity] = useState(school.city);
  const [status, setStatus] = useState(school.status);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await updateSchool(school.id, { name, city, status });
      await onAudit("school.update", `tenants/${school.id}`, { name, city, status });
      setEditing(false);
      await onChanged();
    } catch (err) {
      onError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    const ok = window.confirm(
      `"${school.name}" okulunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
    );
    if (!ok) return;
    setBusy(true);
    try {
      await deleteSchool(school.id);
      await onAudit("school.delete", `tenants/${school.id}`, { name: school.name });
      await onChanged();
    } catch (err) {
      onError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <tr className="text-content">
        <td className="py-2 pr-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-sm outline-none focus:border-accent"
          />
        </td>
        <td className="py-2 pr-4 font-mono text-xs text-accent">{school.slug}</td>
        <td className="py-2 pr-4">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-sm outline-none focus:border-accent"
          />
        </td>
        <td className="py-2 pr-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs outline-none focus:border-accent"
          >
            <option value="ACTIVE" className="bg-surface">Aktif</option>
            <option value="SUSPENDED" className="bg-surface">Askıda</option>
          </select>
        </td>
        <td className="py-2 pr-4">{userCount}</td>
        <td className="py-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-400 disabled:opacity-50"
            >
              <Check size={13} /> Kaydet
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-muted disabled:opacity-50"
            >
              <X size={13} /> İptal
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="text-content">
      <td className="py-2.5 pr-4 font-medium">{school.name}</td>
      <td className="py-2.5 pr-4 font-mono text-xs text-accent">{school.slug}</td>
      <td className="py-2.5 pr-4 text-muted">{school.city || "—"}</td>
      <td className="py-2.5 pr-4">
        <StatusBadge status={school.status} />
      </td>
      <td className="py-2.5 pr-4">{userCount}</td>
      <td className="py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-muted transition hover:text-content"
          >
            <Pencil size={13} /> Düzenle
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-2 py-1 text-xs text-brand transition hover:bg-brand/20 disabled:opacity-50"
          >
            <Trash2 size={13} /> Sil
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <GlassCard tone="navy" className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <span className="text-accent">{icon}</span>
        {label}
      </span>
      <span className="text-2xl font-bold text-content">{value}</span>
    </GlassCard>
  );
}
