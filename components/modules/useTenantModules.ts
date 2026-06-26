"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getTenant } from "@/lib/services/tenants";
import {
  getModuleStatusForTenant,
  type ModuleAccessTenant,
} from "@/lib/modules/resolver";
import type { ModuleStatus } from "@/lib/modules/module-catalog";

/**
 * Aktif tenant'ın modül erişimini (paket + override) tek seferde çeker.
 *
 * Salt-okunur, davranış değiştirmez: tenant verisi yüklenene kadar `tenant`
 * null'dur ve `ready=false`. Hata/eksik durumda da güvenli biçimde null kalır
 * (çözümleyici null tenant'ı varsayılan pakete göre çözer). Sidebar rozetleri
 * ve ModuleGuard bu hook'u kullanır.
 */
export function useTenantModules(): {
  tenant: ModuleAccessTenant | null;
  ready: boolean;
  statusOf: (moduleId: string) => ModuleStatus;
} {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const [tenant, setTenant] = useState<ModuleAccessTenant | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!firebaseReady || !tenantId) {
      setTenant(null);
      setReady(firebaseReady && !tenantId);
      return;
    }
    let active = true;
    setReady(false);
    void (async () => {
      try {
        const rec = await getTenant(tenantId);
        if (active) {
          setTenant(rec ? { packageId: rec.packageId, modules: rec.modules } : null);
          setReady(true);
        }
      } catch {
        if (active) {
          setTenant(null);
          setReady(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, tenantId]);

  return {
    tenant,
    ready,
    statusOf: (moduleId: string) => getModuleStatusForTenant(moduleId, tenant),
  };
}
