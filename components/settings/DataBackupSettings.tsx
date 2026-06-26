"use client";

import { useState } from "react";
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
import { useT } from "@/components/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listSchools } from "@/lib/services/schools";
import { listAllUsers } from "@/lib/services/users";
import { listPlatformAuditLogs } from "@/lib/services/audit-logs";
import { downloadJSON } from "@/lib/export/download";

const items = [
  { id: "gunluk", label: "panelSettings.backup.item.daily", icon: CalendarClock },
  { id: "haftalik", label: "panelSettings.backup.item.weekly", icon: CalendarRange },
  { id: "disa", label: "panelSettings.backup.item.export", icon: Download },
  { id: "log", label: "panelSettings.backup.item.logArchive", icon: Archive },
  { id: "izolasyon", label: "panelSettings.backup.item.isolation", icon: ShieldCheck },
  { id: "kurtarma", label: "panelSettings.backup.item.recovery", icon: RotateCcw },
];

/**
 * Veri ve Yedekleme — Veri Yönetimi.
 * Süper admin için GERÇEK yedek/dışa aktarma: canlı okul + kullanıcı + denetim
 * kaydı verisini JSON olarak indirir. Diğer rollerde bilgilendirme gösterir.
 */
export function DataBackupSettings() {
  const t = useT();
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const exportData = async (withLogs: boolean, key: string) => {
    if (busy) return;
    setBusy(key);
    setMsg(null);
    try {
      const [schools, users, logs] = await Promise.all([
        listSchools(),
        listAllUsers(),
        withLogs ? listPlatformAuditLogs(500) : Promise.resolve([]),
      ]);
      const backup = {
        generatedAt: new Date().toISOString(),
        counts: { schools: schools.length, users: users.length, logs: logs.length },
        schools,
        users,
        ...(withLogs ? { auditLogs: logs } : {}),
      };
      const stamp = new Date().toISOString().slice(0, 10);
      downloadJSON(`ikkoneedu-${withLogs ? "yedek" : "veri"}-${stamp}.json`, backup);
      setMsg(
        t("panelSettings.backup.success", {
          schools: schools.length,
          users: users.length,
          logs: withLogs
            ? t("panelSettings.backup.success.logs", { count: logs.length })
            : "",
        }),
      );
    } catch {
      setMsg(t("panelSettings.backup.error"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <DatabaseBackup size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("panelSettings.backup.title")}</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-overlay/5 bg-overlay/[0.03] p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-content">{t(item.label)}</span>
            </div>
          );
        })}
      </div>

      {isSuper && firebaseReady ? (
        <>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton size="md" onClick={() => exportData(true, "yedek")} disabled={busy !== null}>
              <DatabaseBackup size={16} aria-hidden="true" />
              {busy === "yedek"
                ? t("panelSettings.backup.backup.busy")
                : t("panelSettings.backup.backup.idle")}
            </PrimaryButton>
            <PrimaryButton
              variant="secondary"
              size="md"
              onClick={() => exportData(false, "veri")}
              disabled={busy !== null}
            >
              <Download size={16} aria-hidden="true" />
              {busy === "veri"
                ? t("panelSettings.backup.export.busy")
                : t("panelSettings.backup.export.idle")}
            </PrimaryButton>
            <a href="/super-admin">
              <PrimaryButton variant="secondary" size="md">
                <FileSearch size={16} aria-hidden="true" />
                {t("panelSettings.backup.inspectLogs")}
              </PrimaryButton>
            </a>
          </div>
          {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
        </>
      ) : (
        <p className="mt-6 text-sm text-muted">{t("panelSettings.backup.restricted")}</p>
      )}
    </GlassCard>
  );
}
