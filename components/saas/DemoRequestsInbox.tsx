"use client";

import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import {
  listDemoRequests,
  type DemoRequestRecord,
} from "@/lib/services/demo-requests";

/**
 * Demo talepleri gelen kutusu (gerçek Firestore).
 * Yalnızca giriş yapmış SUPER_ADMIN + Firebase aktifken görünür.
 */
export function DemoRequestsInbox() {
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;
  const [items, setItems] = useState<DemoRequestRecord[] | null>(null);

  useEffect(() => {
    if (!firebaseReady || !isSuper) return;
    let active = true;
    void (async () => {
      const result = await listDemoRequests();
      if (active) setItems(result);
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, isSuper]);

  if (!firebaseReady || !isSuper || items === null) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Rocket size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Demo Talepleri (canlı)</h2>
        <span className="text-xs text-muted">{items.length}</span>
        {items.length > 0 && (
          <DataExportButtons
            className="ml-auto"
            filename="demo-talepleri"
            title="Demo Talepleri"
            columns={[
              { key: "institution", label: "Kurum" },
              { key: "fullName", label: "Yetkili" },
              { key: "phone", label: "Telefon" },
              { key: "email", label: "E-posta" },
              { key: "city", label: "Şehir" },
              { key: "studentCount", label: "Öğrenci Sayısı" },
              { key: "message", label: "Mesaj" },
            ]}
            rows={items as unknown as Record<string, unknown>[]}
          />
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Henüz demo talebi yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 pr-4 font-medium">Kurum</th>
                <th className="pb-2 pr-4 font-medium">Yetkili</th>
                <th className="pb-2 pr-4 font-medium">İletişim</th>
                <th className="pb-2 font-medium">Şehir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((r) => (
                <tr key={r.id} className="text-content">
                  <td className="py-2.5 pr-4 font-medium">{r.institution || "—"}</td>
                  <td className="py-2.5 pr-4 text-muted">{r.fullName || "—"}</td>
                  <td className="py-2.5 pr-4 text-muted">{r.phone || r.email || "—"}</td>
                  <td className="py-2.5 text-muted">{r.city || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
