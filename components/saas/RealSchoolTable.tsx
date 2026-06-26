"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, RefreshCw, Inbox, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useT } from "@/components/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listSchools, type SchoolRecord } from "@/lib/services/schools";

const STATUS_STYLE: Record<string, string> = {
  active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  suspended: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  cancelled: "border-brand/30 bg-brand/10 text-brand",
};

/**
 * Okullar Listesi — GERÇEK Firestore (kök `schools`). Yalnızca SUPER_ADMIN.
 * Mock `SchoolTable` yerine kullanılır; boş/yükleniyor durumları ele alınır.
 */
export function RealSchoolTable() {
  const t = useT();
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;
  const usable = firebaseReady && isSuper;

  const [rows, setRows] = useState<SchoolRecord[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    if (!usable) return;
    setRefreshing(true);
    void listSchools()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    if (usable) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usable]);

  if (!usable) return null;

  const schools = rows ?? [];

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Building2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("panelSaas.schools.heading")}</h2>
        <span className="rounded-full bg-overlay/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted">
          {schools.length}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <DataExportButtons
            filename={t("panelSaas.schools.export.filename")}
            title={t("panelSaas.schools.export.title")}
            columns={[
              { key: "name", label: t("panelSaas.schools.col.name") },
              { key: "city", label: t("panelSaas.schools.col.city") },
              { key: "status", label: t("panelSaas.schools.col.status") },
              { key: "slug", label: t("panelSaas.schools.col.slug") },
            ]}
            rows={schools as unknown as Record<string, unknown>[]}
          />
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            aria-label={t("panelSaas.schools.refreshAria")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-overlay/10 bg-overlay/[0.04] text-muted transition-colors hover:bg-overlay/[0.08] hover:text-content disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        </div>
      </div>

      {rows === null ? (
        <p className="py-10 text-center text-sm text-muted">{t("panelSaas.schools.loading")}</p>
      ) : schools.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <Inbox size={26} className="text-accent" aria-hidden="true" />
          <p className="text-sm">{t("panelSaas.schools.empty")}</p>
        </div>
      ) : (
        <>
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-overlay/10 px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
            <span>{t("panelSaas.schools.th.name")}</span>
            <span>{t("panelSaas.schools.th.city")}</span>
            <span>{t("panelSaas.schools.th.status")}</span>
            <span>{t("panelSaas.schools.th.page")}</span>
            <span className="text-right">{t("panelSaas.schools.th.action")}</span>
          </div>

          <ul className="divide-y divide-overlay/5">
            {schools.map((school) => {
              const statusKey = (school.status || "active").toLowerCase();
              return (
                <li
                  key={school.id}
                  className="flex flex-col gap-3 px-2 py-4 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center lg:gap-4"
                >
                  <span className="text-sm font-semibold text-content">{school.name}</span>
                  <span className="text-sm text-muted">{school.city || "—"}</span>
                  <span>
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLE[statusKey] ?? "border-overlay/10 bg-overlay/5 text-muted"
                      }`}
                    >
                      {school.status || "active"}
                    </span>
                  </span>
                  <span className="text-sm">
                    {school.slug ? (
                      <Link
                        href={`/school/${school.slug}`}
                        className="inline-flex items-center gap-1 text-accent transition-colors hover:text-content"
                      >
                        /{school.slug}
                        <ExternalLink size={12} aria-hidden="true" />
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </span>
                  <span className="lg:text-right">
                    <Link href="/super-admin">
                      <PrimaryButton variant="secondary" size="sm" className="w-full lg:w-auto">
                        {t("panelSaas.schools.manage")}
                      </PrimaryButton>
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </GlassCard>
  );
}
