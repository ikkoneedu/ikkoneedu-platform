"use client";

import { useState } from "react";
import { Ban, RotateCcw } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/auth/role-constants";
import {
  setUserRole,
  setUserStatus,
  type UserStatus,
} from "@/lib/services/users";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

interface UserAdminActionsProps {
  uid: string;
  role: Role;
  status: string;
  /** Bu kullanıcıya atanabilecek roller (yetkiye göre sınırlı). */
  assignableRoles: Role[];
  /** Değişiklik sonrası listeyi tazelemek için. */
  onChanged: () => void | Promise<void>;
  /** Hata mesajını üst bileşene bildirmek için. */
  onError?: (message: string) => void;
  /** Başarılı işlem sonrası denetim kaydı için (action, meta). */
  onAction?: (action: string, meta: Record<string, unknown>) => void | Promise<void>;
}

/**
 * Tek bir kullanıcı için yönetim aksiyonları: rol değiştirme + askıya alma /
 * yeniden etkinleştirme. Süper admin ve okul yönetimi tablolarında kullanılır.
 */
export function UserAdminActions({
  uid,
  role,
  status,
  assignableRoles,
  onChanged,
  onError,
  onAction,
}: UserAdminActionsProps) {
  const [busy, setBusy] = useState(false);
  const suspended = status === "SUSPENDED";

  // Mevcut rol, atanabilir listede olmasa da seçili görünmesi için eklenir.
  const roleOptions = assignableRoles.includes(role)
    ? assignableRoles
    : [role, ...assignableRoles];

  const run = async (
    fn: () => Promise<void>,
    action: string,
    meta: Record<string, unknown>,
  ) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      await onAction?.(action, { uid, ...meta });
      await onChanged();
    } catch (err) {
      onError?.(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRole = (next: Role) => {
    if (next === role) return;
    void run(() => setUserRole(uid, next), "user.role_change", { from: role, to: next });
  };

  const toggleStatus = () => {
    const next: UserStatus = suspended ? "ACTIVE" : "SUSPENDED";
    void run(
      () => setUserStatus(uid, next),
      next === "SUSPENDED" ? "user.suspend" : "user.activate",
      { status: next },
    );
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={busy}
        onChange={(e) => handleRole(e.target.value as Role)}
        className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2 py-1 text-xs text-content outline-none focus:border-accent disabled:opacity-50"
        aria-label="Rol değiştir"
      >
        {roleOptions.map((r) => (
          <option key={r} value={r} className="bg-surface">
            {ROLE_LABELS[r] ?? r}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={toggleStatus}
        disabled={busy}
        className={[
          "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition disabled:opacity-50",
          suspended
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
            : "border-brand/30 bg-brand/10 text-brand hover:bg-brand/20",
        ].join(" ")}
        aria-label={suspended ? "Yeniden etkinleştir" : "Askıya al"}
      >
        {suspended ? <RotateCcw size={13} /> : <Ban size={13} />}
        {suspended ? "Etkinleştir" : "Askıya al"}
      </button>
    </div>
  );
}

/** Okul yönetiminin (süper admin değil) atayabileceği roller — üst yönetim hariç. */
export const MANAGER_ASSIGNABLE_ROLES: Role[] = [
  "PRINCIPAL",
  "VICE_PRINCIPAL",
  "COORDINATOR",
  "TEACHER",
  "PR",
  "PARENT",
  "STUDENT",
] as Role[];
