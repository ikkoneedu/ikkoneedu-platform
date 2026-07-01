"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, RotateCcw, Inbox, CheckCircle2, Copy, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLE_LABELS, type Role } from "@/lib/auth/role-constants";
import {
  listDeletedUsers,
  restoreUserAccount,
  type DeletedUser,
} from "@/lib/services/user-deletion";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/**
 * Silinen Kullanıcılar — süper adminin sildiği hesapların yedeği + geri
 * yükleme. Bkz. `/api/admin/delete-user`, `/api/admin/restore-user`.
 */
export function DeletedUsersPanel({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<DeletedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [restored, setRestored] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setRows(await listDeletedUsers());
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  const restore = async (uid: string) => {
    if (!user || busyId) return;
    setBusyId(uid);
    setError(null);
    setRestored(null);
    try {
      const idToken = await user.getIdToken();
      const result = await restoreUserAccount(idToken, uid);
      if (!result.ok) throw new Error(result.error ?? "Geri yükleme başarısız.");
      setRestored({ email: result.email ?? "", password: result.tempPassword ?? "" });
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const copyPassword = async () => {
    if (!restored) return;
    try {
      await navigator.clipboard.writeText(restored.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (rows.length === 0 && !error && !restored) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Archive size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Silinen Kullanıcılar</h2>
        <span className="text-xs text-muted">{rows.length} kayıt</span>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {restored && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold text-content">Geri yüklendi</p>
            <p className="mt-0.5 text-muted">
              {restored.email} · Geçici şifre:{" "}
              <span className="font-mono text-accent">{restored.password}</span>
            </p>
          </div>
          <PrimaryButton type="button" variant="secondary" size="sm" onClick={copyPassword}>
            {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            {copied ? "Kopyalandı" : "Şifreyi Kopyala"}
          </PrimaryButton>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> Silinen kullanıcı yok.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-overlay/10 bg-overlay/[0.03] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-content">
                  {u.displayName || u.email}
                </p>
                <p className="text-xs text-muted">
                  {u.email} · {ROLE_LABELS[u.role as Role] ?? u.role} · {u.deletedByName ? `silen: ${u.deletedByName}` : ""}
                </p>
              </div>
              <PrimaryButton
                type="button"
                size="sm"
                disabled={busyId === u.id}
                onClick={() => void restore(u.id)}
              >
                <RotateCcw size={14} aria-hidden="true" /> Geri Yükle
              </PrimaryButton>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
