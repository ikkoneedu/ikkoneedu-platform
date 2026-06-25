"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { listNotificationsForCurrentUser } from "@/lib/services/notifications";
import { useT } from "@/components/i18n/LocaleProvider";

/**
 * Üst çubuk bildirim zili — gerçek okunmamış sayacı (userId == uid).
 * Sayaç yalnızca giriş yapmış kullanıcıda ve okunmamış varsa gösterilir.
 */
export function NotificationBell() {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!firebaseReady || !tenantId || !user) return;
    let active = true;

    const fetchUnread = async () => {
      try {
        const rows = await listNotificationsForCurrentUser(tenantId, user.uid);
        if (active) setUnread(rows.filter((n) => !n.read).length);
      } catch {
        if (active) setUnread(0);
      }
    };

    void fetchUnread();

    // Sekmeye geri dönünce / pencere odaklanınca sayacı tazele (canlı his).
    const onFocus = () => void fetchUnread();
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchUnread();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [firebaseReady, tenantId, user]);

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? t("boardD.bell.labelUnread", { count: unread }) : t("boardD.bell.label")}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-overlay/10 bg-overlay/[0.04] text-muted transition-colors hover:bg-overlay/[0.08] hover:text-content"
    >
      <Bell size={18} aria-hidden="true" />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
