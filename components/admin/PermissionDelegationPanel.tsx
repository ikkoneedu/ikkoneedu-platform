"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { KeyRound, AlertCircle, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasRole } from "@/components/auth/RoleGate";
import { ROLES } from "@/lib/auth/role-constants";
import { PROTECTED_PREFIXES } from "@/lib/auth/route-config";
import { listTenantUsers, type TenantUser } from "@/lib/services/users";
import {
  grantPermission,
  revokePermissionGrant,
  listGrantsByTenant,
  type PermissionGrant,
} from "@/lib/services/permission-grants";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const GRANTABLE_ROUTES = PROTECTED_PREFIXES.filter(
  (r) => !["/super-admin", "/saas-admin"].includes(r),
).sort();

/**
 * Genel Müdür (ve üstü) görev bazlı geçici yetki devri paneli.
 * Belirli bir kullanıcıya statik rol yetkisinin dışında bir ekranı (route)
 * geçici olarak açar (örn. bursluluk görevi için ders programını bir
 * öğretmene açmak). Bkz. `lib/services/permission-grants.ts`.
 */
export function PermissionDelegationPanel() {
  const { user, profile, firebaseReady, loading } = useAuth();
  const canManage = useHasRole([
    ROLES.SCHOOL_ADMIN,
    ROLES.FOUNDER,
    ROLES.SUPER_ADMIN,
  ]);
  const tenantId = profile?.tenantId;
  const granterUid = user?.uid;
  const ready = firebaseReady && Boolean(tenantId) && Boolean(granterUid) && canManage;

  const [staff, setStaff] = useState<TenantUser[]>([]);
  const [grants, setGrants] = useState<PermissionGrant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      const [users, activeGrants] = await Promise.all([
        listTenantUsers(tenantId),
        listGrantsByTenant(tenantId),
      ]);
      setStaff(users.filter((u) => u.uid !== granterUid && u.status === "ACTIVE"));
      setGrants(activeGrants);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, granterUid]);

  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  const handleGrant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !granterUid || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const granteeUid = String(data.get("granteeUid") ?? "");
    const route = String(data.get("route") ?? "");
    const note = String(data.get("note") ?? "").trim();
    const expiresRaw = String(data.get("expiresAt") ?? "");
    const grantee = staff.find((s) => s.uid === granteeUid);
    if (!granteeUid || !route || !grantee) {
      setError("Lütfen personel ve ekran seçin.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await grantPermission(tenantId, {
        granteeUid,
        granteeName: grantee.displayName || grantee.email,
        route,
        note,
        grantedBy: granterUid,
        grantedByName: profile?.displayName ?? "",
        expiresAt: expiresRaw ? new Date(expiresRaw) : null,
      });
      form.reset();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (grantId: string) => {
    if (!tenantId || busy) return;
    setBusy(true);
    try {
      await revokePermissionGrant(tenantId, grantId);
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !canManage) return null;

  if (!ready) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm text-muted">
          Yetki devri yalnızca Genel Müdür/Kurucu hesabıyla, Firebase yapılandırması
          aktifken kullanılabilir.
        </p>
      </GlassCard>
    );
  }

  const activeGrants = grants.filter((g) => g.status === "active");

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Görev Bazlı Yetki Devri</h2>
      </div>
      <p className="mb-4 text-sm text-muted">
        Bir personele, rolünün dışında belirli bir ekranı geçici olarak açın
        (ör. bursluluk görevi için ders programı ekranı).
      </p>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      <form
        onSubmit={handleGrant}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Personel</label>
          <select
            name="granteeUid"
            defaultValue=""
            required
            className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value="" disabled className="bg-surface">Seçin…</option>
            {staff.map((s) => (
              <option key={s.uid} value={s.uid} className="bg-surface">
                {s.displayName || s.email}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Ekran</label>
          <select
            name="route"
            defaultValue=""
            required
            className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value="" disabled className="bg-surface">Seçin…</option>
            {GRANTABLE_ROUTES.map((route) => (
              <option key={route} value={route} className="bg-surface">{route}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Görev notu (opsiyonel)</label>
          <input
            name="note"
            type="text"
            placeholder="Bursluluk sınavı görevi"
            className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Bitiş (opsiyonel)</label>
          <input
            name="expiresAt"
            type="date"
            className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <PrimaryButton type="submit" size="md" disabled={busy} className="lg:col-span-4">
          <KeyRound size={16} aria-hidden="true" />
          Yetkiyi Ver
        </PrimaryButton>
      </form>

      {activeGrants.length > 0 && (
        <div className="mt-6 flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Aktif Yetki Devirleri
          </h3>
          {activeGrants.map((g) => (
            <div
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-overlay/10 bg-overlay/[0.03] px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-content">
                  {g.granteeName} <span className="text-muted">→</span>{" "}
                  <span className="font-mono text-accent">{g.route}</span>
                </p>
                {g.note && <p className="text-xs text-muted">{g.note}</p>}
              </div>
              <PrimaryButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => handleRevoke(g.id)}
              >
                <Trash2 size={14} aria-hidden="true" />
                Geri Al
              </PrimaryButton>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
