import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LiveSettings } from "@/components/settings/LiveSettings";
import { SchoolBrandingEditor } from "@/components/school/SchoolBrandingEditor";
import { FirebaseStatusCard } from "@/components/settings/FirebaseStatusCard";
import { DataBackupSettings } from "@/components/settings/DataBackupSettings";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("panelSettings.meta.title", { product: productName }),
    description: t("panelSettings.meta.description"),
  };
}

const categories = [
  { id: "okul-ayarlari", labelKey: "panelSettings.category.school" },
  { id: "marka", labelKey: "panelSettings.category.brand" },
  { id: "baglanti", labelKey: "panelSettings.category.connection" },
  { id: "veri", labelKey: "panelSettings.category.data" },
];

export default async function SettingsPage() {
  const t = await getServerT();
  return (
    <PageShell title={t("panelSettings.page.title")}>
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow={t("panelSettings.header.eyebrow")}
          title={t("panelSettings.header.title")}
          description={t("panelSettings.header.description")}
        />

        {/* Kategori hızlı navigasyonu */}
        <nav className="sticky top-16 z-20 -mx-4 overflow-x-auto border-y border-overlay/10 bg-background/70 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <div className="flex gap-2">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="shrink-0 rounded-full border border-overlay/10 bg-overlay/[0.04] px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                {t(category.labelKey)}
              </a>
            ))}
          </div>
        </nav>

        {/* Canlı okul ayarları — Firestore (tüm modüllerin tek kaynağı) */}
        <section id="okul-ayarlari" className="scroll-mt-32">
          <LiveSettings />
        </section>

        {/* Okul marka kimliği (white-label) — public okul sayfasını kişiselleştirir */}
        <section id="marka" className="scroll-mt-32">
          <SchoolBrandingEditor />
        </section>

        {/* Firebase bağlantı durumu */}
        <section id="baglanti" className="scroll-mt-32">
          <FirebaseStatusCard />
        </section>

        {/* Veri yedekleme / dışa aktarma (canlı) */}
        <section id="veri" className="scroll-mt-32">
          <DataBackupSettings />
        </section>
      </div>
    </PageShell>
  );
}
