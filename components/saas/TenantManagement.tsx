"use client";

import { useState } from "react";
import { TenantOnboarding } from "@/components/saas/TenantOnboarding";
import { TenantsTable } from "@/components/saas/TenantsTable";

/**
 * Tenant onboarding + tenant/okul/admin listesi (SaaS Admin alanı).
 * Onboarding tamamlanınca listeyi tazeler. Yalnızca SUPER_ADMIN'de görünür
 * (alt bileşenler kendi yetki kontrolünü yapar).
 */
export function TenantManagement() {
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <div className="flex flex-col gap-6">
      <TenantOnboarding onCreated={() => setReloadKey((k) => k + 1)} />
      <TenantsTable reloadKey={reloadKey} />
    </div>
  );
}
