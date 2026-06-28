"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  Award,
  ClipboardList,
  Inbox,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listScholarshipApplications,
  type ScholarshipApplicationRecord,
} from "@/lib/services/scholarship-applications";

const STAFF_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.PR,
  ROLES.SALES,
  ROLES.SUPER_ADMIN,
];

function countBy(rows: ScholarshipApplicationRecord[], pred: (r: ScholarshipApplicationRecord) => boolean): number {
  return rows.filter(pred).length;
}

/**
 * Bursluluk genel durum panosu — GERÇEK metrikler (`scholarshipApplications`).
 * Başvuru sayımları gerçek Firestore verisinden hesaplanır.
 */
export function ScholarshipDashboard() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const usable = firebaseReady && Boolean(tenantId) && profile != null && STAFF_ROLES.includes(profile.role);

  const [rows, setRows] = useState<ScholarshipApplicationRecord[] | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) return;
    try {
      setRows(await listScholarshipApplications(tenantId));
    } catch {
      setRows([]);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) return null;

  const all = rows ?? [];
  const lc = (s: string) => s.toLowerCase();
  const metrics: { id: string; label: string; value: number; icon: LucideIcon }[] = [
    { id: "total", label: "Toplam Başvuru", value: all.length, icon: FileText },
    { id: "pending", label: "Bekleyen", value: countBy(all, (r) => lc(r.status).includes("bekl") || lc(r.status).includes("eksik")), icon: Clock },
    { id: "approved", label: "Onaylanan", value: countBy(all, (r) => lc(r.status).includes("onay") || lc(r.status).includes("kayıt")), icon: CheckCircle2 },
    { id: "examined", label: "Sınava Giren", value: countBy(all, (r) => Boolean(r.examScore)), icon: ClipboardList },
    { id: "scholarship", label: "Burs Kazanan", value: countBy(all, (r) => Boolean(r.scholarshipRate) && r.scholarshipRate !== "0" && r.scholarshipRate !== "%0"), icon: Award },
  ];

  return (
    <div className="flex flex-col gap-3">
      {rows !== null && all.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> Henüz bursluluk başvurusu yok. Metrikler başvurular geldikçe dolacak.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <GlassCard key={m.id} tone="navy" interactive className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted">{m.label}</p>
                  <p className="mt-2 text-xl font-bold tracking-tight text-content sm:text-2xl">
                    {rows === null ? "…" : m.value}
                  </p>
                </div>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon size={18} aria-hidden="true" />
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
