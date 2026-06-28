"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  UserPlus,
  Copy,
  CheckCircle2,
  AlertCircle,
  Users,
  Mail,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasRole } from "@/components/auth/RoleGate";
import { ROLES, ROLE_LABELS } from "@/lib/auth/role-constants";
import {
  createStaffAccount,
  listTenantUsers,
  type TenantUser,
  type StaffRole,
} from "@/lib/services/users";
import {
  UserAdminActions,
  MANAGER_ASSIGNABLE_ROLES,
} from "@/components/admin/UserAdminActions";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { createAuditLog } from "@/lib/services/audit-logs";
import { sendPasswordReset } from "@/lib/services/auth-actions";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import {
  DEPARTMENTS,
  DEFAULT_DEPARTMENT_ID,
  departmentLabel,
} from "@/lib/staff/departments";

/**
 * Okul yöneticisi personel & kullanıcı yönetimi.
 * Öğretmen/müdür hesabı oluşturur (geçici şifre ile) ve tenant kullanıcılarını
 * listeler. Oluşturma yalnızca SCHOOL_ADMIN/SUPER_ADMIN'e açıktır.
 */
export function StaffManager() {
  const { user, profile, firebaseReady, loading } = useAuth();
  const canCreate = useHasRole([
    ROLES.SCHOOL_ADMIN,
    ROLES.FOUNDER,
    ROLES.PRINCIPAL,
    ROLES.SUPER_ADMIN,
  ]);
  const tenantId = profile?.tenantId;
  const adminUid = user?.uid;
  const ready = firebaseReady && Boolean(tenantId) && Boolean(adminUid);

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const sendReset = async () => {
    if (!created || resetState === "sending") return;
    setResetState("sending");
    const result = await sendPasswordReset(created.email);
    setResetState(result.ok ? "sent" : "error");
  };

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setUsers(await listTenantUsers(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId]);

  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !adminUid || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const displayName = String(data.get("displayName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const role = String(data.get("role") ?? ROLES.TEACHER) as StaffRole;
    const department = String(data.get("department") ?? DEFAULT_DEPARTMENT_ID);
    if (!displayName || !email.includes("@")) {
      setError("Lütfen ad soyad ve geçerli bir e-posta girin.");
      return;
    }

    setBusy(true);
    setError(null);
    setCreated(null);
    setResetState("idle");
    try {
      const result = await createStaffAccount({
        tenantId,
        createdBy: adminUid,
        role,
        displayName,
        email,
        department,
      });
      setCreated({ email: result.email, password: result.tempPassword });
      form.reset();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copyPassword = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.password);
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
          <p className="font-semibold text-content">Kullanıcı yönetimi kullanılamıyor</p>
          <p className="mt-1">
            Bu özellik yalnızca giriş yapmış, bir okula bağlı yönetici hesabıyla
            ve Firebase yapılandırması aktifken çalışır.
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

      {canCreate && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Personel Oluştur</h2>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
            <TextField label="Ad Soyad" name="displayName" placeholder="Ad Soyad" required />
            <TextField label="E-posta" name="email" type="email" placeholder="ornek@okul.com" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Rol</label>
              <select
                name="role"
                defaultValue={ROLES.TEACHER}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value={ROLES.TEACHER} className="bg-surface">{ROLE_LABELS.TEACHER}</option>
                <option value={ROLES.PRINCIPAL} className="bg-surface">{ROLE_LABELS.PRINCIPAL}</option>
                <option value={ROLES.VICE_PRINCIPAL} className="bg-surface">{ROLE_LABELS.VICE_PRINCIPAL}</option>
                <option value={ROLES.COORDINATOR} className="bg-surface">{ROLE_LABELS.COORDINATOR}</option>
                <option value={ROLES.PR} className="bg-surface">{ROLE_LABELS.PR}</option>
                <option value={ROLES.DRIVER} className="bg-surface">{ROLE_LABELS.DRIVER}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Departman</label>
              <select
                name="department"
                defaultValue={DEFAULT_DEPARTMENT_ID}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-surface">{d.label}</option>
                ))}
              </select>
            </div>
            <PrimaryButton type="submit" size="md" disabled={busy} className="lg:col-span-2">
              <UserPlus size={16} aria-hidden="true" />
              Oluştur
            </PrimaryButton>
          </form>

          {created && (
            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <p className="font-semibold text-content">Hesap oluşturuldu</p>
                <p className="mt-0.5 text-muted">
                  {created.email} · Geçici şifre:{" "}
                  <span className="font-mono text-accent">{created.password}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Bu bilgileri personele iletin; e-posta + şifre ile giriş yapacak.
                  Alternatif olarak şifre belirleme e-postası gönderebilirsiniz.
                </p>
                {resetState === "sent" && (
                  <p className="mt-1 text-xs text-emerald-400">
                    Şifre belirleme e-postası gönderildi.
                  </p>
                )}
                {resetState === "error" && (
                  <p className="mt-1 text-xs text-brand">E-posta gönderilemedi.</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <PrimaryButton type="button" variant="secondary" size="sm" onClick={copyPassword}>
                  {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  {copied ? "Kopyalandı" : "Şifreyi Kopyala"}
                </PrimaryButton>
                <PrimaryButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={sendReset}
                  disabled={resetState === "sending" || resetState === "sent"}
                >
                  <Mail size={15} aria-hidden="true" />
                  {resetState === "sending"
                    ? "Gönderiliyor…"
                    : resetState === "sent"
                      ? "Gönderildi"
                      : "Şifre E-postası"}
                </PrimaryButton>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Users size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Okul Kullanıcıları</h2>
          <span className="text-xs text-muted">{users.length} kayıt</span>
          <DataExportButtons
            className="ml-auto"
            filename="okul-kullanicilari"
            title="Okul Kullanıcıları"
            columns={[
              { key: "displayName", label: "Ad" },
              { key: "email", label: "E-posta" },
              { key: "role", label: "Rol" },
              { key: "departmentLabel", label: "Departman" },
              { key: "status", label: "Durum" },
            ]}
            rows={users.map((u) => ({
              ...u,
              departmentLabel: u.department ? departmentLabel(u.department) : "—",
            })) as unknown as Record<string, unknown>[]}
          />
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
                  <th className="pb-2 pr-4 font-medium">Departman</th>
                  <th className="pb-2 pr-4 font-medium">Durum</th>
                  <th className="pb-2 font-medium">{canCreate ? "Rol / İşlem" : "Rol"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-overlay/5">
                {users.map((u) => {
                  const isManagement =
                    u.role === ROLES.SUPER_ADMIN ||
                    u.role === ROLES.FOUNDER ||
                    u.role === ROLES.SCHOOL_ADMIN;
                  const canManage =
                    canCreate && u.uid !== adminUid && !isManagement;
                  return (
                    <tr key={u.uid} className="text-content">
                      <td className="py-2.5 pr-4">{u.displayName || "—"}</td>
                      <td className="py-2.5 pr-4 text-muted">{u.email}</td>
                      <td className="py-2.5 pr-4 text-muted">
                        {u.department ? departmentLabel(u.department) : "—"}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={[
                            "rounded-full border px-2 py-0.5 text-xs",
                            u.status === "SUSPENDED"
                              ? "border-brand/30 bg-brand/10 text-brand"
                              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
                          ].join(" ")}
                        >
                          {u.status === "SUSPENDED" ? "Askıda" : u.status || "—"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {canManage ? (
                          <UserAdminActions
                            uid={u.uid}
                            role={u.role}
                            status={u.status}
                            assignableRoles={MANAGER_ASSIGNABLE_ROLES}
                            onChanged={refresh}
                            onError={setError}
                            onAction={async (action, meta) => {
                              if (!tenantId) return;
                              await createAuditLog({
                                tenantId,
                                actorId: adminUid,
                                action,
                                resource: `users/${u.uid}`,
                                meta,
                              });
                            }}
                          />
                        ) : (
                          ROLE_LABELS[u.role] ?? u.role
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
