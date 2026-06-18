import {
  DatabaseBackup,
  CalendarClock,
  CalendarRange,
  Download,
  Archive,
  ShieldCheck,
  RotateCcw,
  FileSearch,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

const items = [
  { id: "gunluk", label: "Günlük Yedekleme", icon: CalendarClock },
  { id: "haftalik", label: "Haftalık Yedekleme", icon: CalendarRange },
  { id: "disa", label: "Veri Dışa Aktarma", icon: Download },
  { id: "log", label: "Log Arşivi", icon: Archive },
  { id: "izolasyon", label: "Okul Bazlı Veri İzolasyonu", icon: ShieldCheck },
  { id: "kurtarma", label: "Silinen Veri Kurtarma", icon: RotateCcw },
];

/**
 * Veri ve Yedekleme — Veri Yönetimi.
 * Yedekleme türleri ve veri işlemleri (mock butonlar).
 */
export function DataBackupSettings() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <DatabaseBackup size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Veri Yönetimi</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-content">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <PrimaryButton size="md">
          <DatabaseBackup size={16} aria-hidden="true" />
          Yedek Al
        </PrimaryButton>
        <PrimaryButton variant="secondary" size="md">
          <Download size={16} aria-hidden="true" />
          Verileri Dışa Aktar
        </PrimaryButton>
        <PrimaryButton variant="secondary" size="md">
          <FileSearch size={16} aria-hidden="true" />
          Logları İncele
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}
