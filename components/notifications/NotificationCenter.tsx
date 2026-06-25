"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  RefreshCw,
  Inbox,
  AlertCircle,
  CheckCheck,
  ArrowUpRight,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  listNotificationsForCurrentUser,
  markNotificationRead,
  type UserNotificationRecord,
} from "@/lib/services/notifications";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const TYPE_TONES: Record<string, string> = {
  message: "border-accent/20 bg-accent/10 text-accent",
  announcement: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  scholarship: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  crm: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  system: "border-overlay/15 bg-overlay/5 text-muted",
};

const TYPE_LABELS: Record<string, string> = {
  message: "Mesaj",
  announcement: "Duyuru",
  scholarship: "Bursluluk",
  crm: "CRM",
  system: "Sistem",
};

function formatDate(ms: number | null): string {
  if (!ms) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

/**
 * Kişisel Bildirim Merkezi — `tenants/{tenantId}/notifications` (userId == uid).
 * Yalnızca kullanıcının kendi bildirimleri; okundu/okunmadı işaretleme. FCM yok.
 */
export function NotificationCenter() {
  const { user, profile, firebaseReady } = useAuth();
  const uid = user?.uid ?? "";
  const tenantId = profile?.tenantId;
  const usable = firebaseReady && Boolean(uid) && Boolean(tenantId);

  const [items, setItems] = useState<UserNotificationRecord[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId || !uid) return;
    setRefreshing(true);
    setError(null);
    try {
      setItems(await listNotificationsForCurrentUser(tenantId, uid));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId, uid]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  const markRead = async (id: string) => {
    if (!tenantId) return;
    try {
      await markNotificationRead(tenantId, id);
      setItems((prev) =>
        prev ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev,
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const markAll = async () => {
    if (!tenantId || !items || busy) return;
    setBusy(true);
    try {
      const unread = items.filter((n) => !n.read);
      await Promise.all(unread.map((n) => markNotificationRead(tenantId, n.id)));
      setItems((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : prev));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!usable) return null;

  const unreadCount = items?.filter((n) => !n.read).length ?? 0;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Bell size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bildirimlerim</h2>
        {unreadCount > 0 && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
            {unreadCount} yeni
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAll()}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg border border-overlay/10 px-2 py-1 text-xs text-muted transition hover:text-content disabled:opacity-50"
            >
              <CheckCheck size={13} aria-hidden="true" /> Tümünü okundu yap
            </button>
          )}
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="text-muted transition hover:text-content disabled:opacity-50"
            aria-label="Yenile"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {items === null ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> Henüz bildiriminiz yok.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg border bg-overlay/[0.02] px-3 py-2.5 ${
                n.read ? "border-overlay/10" : "border-accent/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    TYPE_TONES[n.type] ?? TYPE_TONES.system
                  }`}
                >
                  {TYPE_LABELS[n.type] ?? n.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.read ? "text-content" : "font-semibold text-content"}`}>
                    {n.title || "—"}
                  </p>
                  {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span>{formatDate(n.createdAt)}</span>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-0.5 text-accent hover:underline"
                      >
                        Görüntüle <ArrowUpRight size={12} aria-hidden="true" />
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => void markRead(n.id)}
                        className="text-accent hover:underline"
                      >
                        Okundu yap
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
