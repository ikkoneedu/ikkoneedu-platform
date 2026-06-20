"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  Plus,
  AlertCircle,
  Users,
  School,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasRole } from "@/components/auth/RoleGate";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/auth/role-constants";
import { listAllUsers, type AllUser } from "@/lib/services/users";
import {
  createSchool,
  listSchools,
  toSlug,
  type SchoolRecord,
} from "@/lib/services/schools";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [slugPreview, setSlugPreview] = useState("");

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [s, u] = await Promise.all([listSchools(), listAllUsers()]);
      setSchools(s);
      setUsers(u);
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

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!adminUid || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const slug = String(data.get("slug") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    if (!name) {
      setError("Lütfen okul adını girin.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await createSchool({ name, slug, city, createdBy: adminUid });
      form.reset();
      setSlugPreview("");
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
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

      {/* Okul oluştur */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Okul Oluştur</h2>
        </div>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <TextField
            label="Okul Adı"
            name="name"
            placeholder="Örnek Koleji"
            required
            onChange={(e) => setSlugPreview(toSlug(e.target.value))}
          />
          <TextField
            label="Kısa Ad (slug)"
            name="slug"
            placeholder={slugPreview || "ornek-koleji"}
            onChange={(e) => setSlugPreview(toSlug(e.target.value))}
          />
          <TextField label="Şehir" name="city" placeholder="İstanbul" />
          <PrimaryButton type="submit" size="md" disabled={busy}>
            <Plus size={16} aria-hidden="true" />
            {busy ? "Oluşturuluyor…" : "Oluştur"}
          </PrimaryButton>
        </form>
        {slugPreview && (
          <p className="mt-2 text-xs text-muted">
            Kimlik: <span className="font-mono text-accent">{slugPreview}</span>
          </p>
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
                  <th className="pb-2 font-medium">Kullanıcı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {schools.map((s) => (
                  <tr key={s.id} className="text-content">
                    <td className="py-2.5 pr-4 font-medium">{s.name}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-accent">{s.slug}</td>
                    <td className="py-2.5 pr-4 text-muted">{s.city || "—"}</td>
                    <td className="py-2.5">{usersByTenant.get(s.id) ?? 0}</td>
                  </tr>
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
                  <th className="pb-2 pr-4 font-medium">Rol</th>
                  <th className="pb-2 pr-4 font-medium">Okul</th>
                  <th className="pb-2 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.uid} className="text-content">
                    <td className="py-2.5 pr-4">{u.displayName || "—"}</td>
                    <td className="py-2.5 pr-4 text-muted">{u.email}</td>
                    <td className="py-2.5 pr-4">{ROLE_LABELS[u.role] ?? u.role}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted">{u.tenantId || "—"}</td>
                    <td className="py-2.5">
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-400">
                        {u.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
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
