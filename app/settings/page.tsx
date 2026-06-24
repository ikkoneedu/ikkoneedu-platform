import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LiveSettings } from "@/components/settings/LiveSettings";
import { FirebaseStatusCard } from "@/components/settings/FirebaseStatusCard";
import { DataBackupSettings } from "@/components/settings/DataBackupSettings";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Sistem Ayarları — ${productName}`,
  description:
    "Okul yapılandırması, bağlantı durumu ve veri yedekleme tek merkezden.",
};

const categories = [
  { id: "okul-ayarlari", label: "Okul Ayarları" },
  { id: "baglanti", label: "Bağlantı" },
  { id: "veri", label: "Veri" },
];

export default function SettingsPage() {
  return (
    <PageShell title="Sistem Ayarları">
      <div className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="Yönetim"
          title="Sistem Ayarları"
          description="Okul yapılandırmasını, Firebase bağlantı durumunu ve veri yedeklemeyi yönetin. (Rol/güvenlik/AI ayar panelleri ilgili fazlarda eklenecek.)"
        />

        {/* Kategori hızlı navigasyonu */}
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

        {/* Canlı okul ayarları — Firestore (tüm modüllerin tek kaynağı) */}
        <section id="okul-ayarlari" className="scroll-mt-32">
          <LiveSettings />
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
