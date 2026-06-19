import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PlatformSettings } from "@/components/settings/PlatformSettings";
import { TenantSettings } from "@/components/settings/TenantSettings";
import { RoleManagement } from "@/components/settings/RoleManagement";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { AiModelSettings } from "@/components/settings/AiModelSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { FirebaseStatusCard } from "@/components/settings/FirebaseStatusCard";
import { DataBackupSettings } from "@/components/settings/DataBackupSettings";
import { SystemHealth } from "@/components/settings/SystemHealth";
import { AuditLog } from "@/components/settings/AuditLog";
import { productName } from "@/lib/constants";
import {
  settingsTenants,
  settingsRoles,
  securityOptions,
  aiProviders,
  aiConfig,
  notificationChannels,
  integrations,
  settingsSystemHealth,
  auditLogs,
} from "@/lib/settings-mock-data";

export const metadata: Metadata = {
  title: `Sistem Ayarları — ${productName}`,
  description:
    "Okul, kullanıcı, güvenlik, yapay zeka ve platform yapılandırmalarını tek merkezden yönetin.",
};

const categories = [
  { id: "platform", label: "Platform" },
  { id: "okullar", label: "Okullar" },
  { id: "roller", label: "Roller" },
  { id: "guvenlik", label: "Güvenlik" },
  { id: "yapay-zeka", label: "Yapay Zeka" },
  { id: "bildirimler", label: "Bildirimler" },
  { id: "entegrasyonlar", label: "Entegrasyonlar" },
  { id: "veri", label: "Veri" },
  { id: "sistem", label: "Sistem" },
  { id: "audit", label: "İşlem Geçmişi" },
];

export default function SettingsPage() {
  return (
    <PageShell title="Sistem Ayarları">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Süper Admin"
          title="Sistem Ayarları"
          description="Okul, kullanıcı, güvenlik, yapay zeka ve platform yapılandırmalarını tek merkezden yönetin."
        />

        {/* Kategori hızlı navigasyonu — mobilde yatay kaydırmalı */}
        <nav className="sticky top-16 z-20 -mx-4 overflow-x-auto border-y border-white/10 bg-background/70 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <div className="flex gap-2">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                {category.label}
              </a>
            ))}
          </div>
        </nav>

        <section id="platform" className="scroll-mt-32">
          <PlatformSettings />
        </section>
        <section id="okullar" className="scroll-mt-32">
          <TenantSettings tenants={settingsTenants} />
        </section>
        <section id="roller" className="scroll-mt-32">
          <RoleManagement roles={settingsRoles} />
        </section>
        <section id="guvenlik" className="scroll-mt-32">
          <SecuritySettings options={securityOptions} />
        </section>
        <section id="yapay-zeka" className="scroll-mt-32">
          <AiModelSettings providers={aiProviders} config={aiConfig} />
        </section>
        <section id="bildirimler" className="scroll-mt-32">
          <NotificationSettings channels={notificationChannels} />
        </section>
        <section id="entegrasyonlar" className="scroll-mt-32 space-y-6">
          <FirebaseStatusCard />
          <IntegrationSettings integrations={integrations} />
        </section>
        <section id="veri" className="scroll-mt-32">
          <DataBackupSettings />
        </section>
        <section id="sistem" className="scroll-mt-32">
          <SystemHealth rows={settingsSystemHealth} />
        </section>
        <section id="audit" className="scroll-mt-32">
          <AuditLog entries={auditLogs} />
        </section>
      </div>
    </PageShell>
  );
}
