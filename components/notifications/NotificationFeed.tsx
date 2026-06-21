"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, RefreshCw, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  listNotifications,
  type NotificationRecord,
} from "@/lib/services/notifications";

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
 * Canlı Bildirim Akışı — `tenants/{tenantId}/notifications` (gerçek Firestore).
 * Tenant üyesi tüm bildirimleri görür. FCM/push yok; yalnızca panelde gösterim.
 */
export function NotificationFeed() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const usable = firebaseReady && Boolean(tenantId);

  const [items, setItems] = useState<NotificationRecord[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    try {
      setItems(await listNotifications(tenantId));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable || items === null) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <BellRing size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bildirim Akışı (canlı)</h2>
        <span className="text-xs text-muted">{items.length}</span>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
          aria-label="Yenile"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> Henüz bildirim yok. Yukarıdan oluşturun.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <li key={n.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-content">{n.title || "—"}</span>
                <span className="shrink-0 text-xs text-muted">{formatDate(n.createdAt)}</span>
              </div>
              {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}
              <p className="mt-1 text-xs text-muted/70">
                {n.audience}
                {n.createdByName ? ` · ${n.createdByName}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
