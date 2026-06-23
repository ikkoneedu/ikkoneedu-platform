"use client";

import { useEffect, useState } from "react";
import {
  School,
  CheckCircle2,
  Handshake,
  MailQuestion,
  type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listSchools } from "@/lib/services/schools";
import { listPlatformLeads } from "@/lib/services/leads";
import { listDemoRequests } from "@/lib/services/demo-requests";

interface Metric {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
}

/**
 * Platform Genel Durumu — GERÇEK Firestore. Yalnızca SUPER_ADMIN okur
 * (kök koleksiyonlar: schools / platformLeads / platformDemoRequests).
 * Mock `SaasOverview` yerine kullanılır.
 */
export function RealSaasOverview() {
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;
  const usable = firebaseReady && isSuper;

  const [schools, setSchools] = useState<number | null>(null);
  const [activeSchools, setActiveSchools] = useState<number>(0);
  const [leads, setLeads] = useState<number>(0);
  const [demos, setDemos] = useState<number>(0);

  useEffect(() => {
    if (!usable) return;
    let active = true;
    void (async () => {
      try {
        const [s, l, d] = await Promise.all([
          listSchools(),
          listPlatformLeads(),
          listDemoRequests(),
        ]);
        if (!active) return;
        setSchools(s.length);
        setActiveSchools(
          s.filter((x) => (x.status || "").toLowerCase() === "active").length,
        );
        setLeads(l.length);
        setDemos(d.length);
      } catch {
        if (active) setSchools(0);
      }
    })();
    return () => {
      active = false;
    };
  }, [usable]);

  if (!usable) return null;

  const ready = schools !== null;
  const metrics: Metric[] = [
    { id: "okul", label: "Toplam Okul", value: schools ?? 0, icon: School },
    { id: "aktif", label: "Aktif Okul", value: activeSchools, icon: CheckCircle2 },
    { id: "lead", label: "Platform Lead", value: leads, icon: Handshake },
    { id: "demo", label: "Demo Talebi", value: demos, icon: MailQuestion },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <GlassCard key={metric.id} tone="navy" interactive className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">{metric.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-content">
              {ready ? metric.value : "—"}
            </p>
          </GlassCard>
        );
      })}
    </div>
  );
}
