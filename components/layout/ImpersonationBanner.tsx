"use client";

import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { getTenant } from "@/lib/services/tenants";

/**
 * Süper admin bir okulu (tenant) görüntülerken sayfa üstünde net uyarı.
 * Yanlışlıkla yanlış okula veri girilmesini önler; tek tıkla platforma döner.
 * Yalnızca SUPER_ADMIN + activeTenantId seçiliyken görünür.
 */
export function ImpersonationBanner() {
  const { profile, firebaseReady, activeTenantId, setActiveTenant } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!firebaseReady || !isSuper || !activeTenantId) return;
    let active = true;
    void (async () => {
      try {
        const t = await getTenant(activeTenantId);
        if (active) setName(t?.name ?? activeTenantId);
      } catch {
        if (active) setName(activeTenantId);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, isSuper, activeTenantId]);

  if (!firebaseReady || !isSuper || !activeTenantId) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-200 sm:px-6 lg:px-8">
      <Eye size={15} className="shrink-0" aria-hidden="true" />
      <span>
        <span className="font-semibold">{name || activeTenantId}</span> okulunu
        görüntülüyorsunuz (süper admin). Girdiğiniz veriler bu okula kaydedilir.
      </span>
      <button
        type="button"
        onClick={() => setActiveTenant(null)}
        className="ml-auto flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-100 transition-colors hover:bg-amber-400/20"
      >
        <X size={13} aria-hidden="true" />
        Platforma dön
      </button>
    </div>
  );
}
