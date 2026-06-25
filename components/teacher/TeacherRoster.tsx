"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { listMyCodes, type AccessCodeRecord } from "@/lib/services/access-codes";

/**
 * Öğretmenin kendi öğrenci/veli listesi (gerçek Firestore).
 * Yalnızca giriş yapmış öğretmen + Firebase aktifken görünür.
 */
export function TeacherRoster() {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const teacherUid = user?.uid;
  const isTeacher = profile?.role === ROLES.TEACHER;

  const [codes, setCodes] = useState<AccessCodeRecord[] | null>(null);

  useEffect(() => {
    if (!firebaseReady || !tenantId || !teacherUid || !isTeacher) return;
    let active = true;
    void (async () => {
      const result = await listMyCodes(tenantId, teacherUid);
      if (active) setCodes(result);
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, tenantId, teacherUid, isTeacher]);

  if (!firebaseReady || !isTeacher || !codes) return null;

  const students = codes.filter((c) => c.role === ROLES.STUDENT);
  const parents = codes.filter((c) => c.role === ROLES.PARENT);

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Users size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sınıfım (canlı)</h2>
        <span className="text-xs text-muted">
          {students.length} öğrenci · {parents.length} veli
        </span>
        {codes.length > 0 && (
          <DataExportButtons
            className="ml-auto"
            filename="sinif-listesi"
            title="Sınıf Listesi"
            formats={["pdf", "csv", "xml"]}
            columns={[
              { key: "displayName", label: "Ad" },
              { key: "role", label: "Tür" },
              { key: "code", label: "Kod" },
              { key: "classId", label: "Sınıf" },
            ]}
            rows={codes as unknown as Record<string, unknown>[]}
          />
        )}
      </div>

      {codes.length === 0 ? (
        <p className="text-sm text-muted">
          Henüz öğrenci/veli yok.{" "}
          <a href="/teacher/classes" className="text-accent hover:text-content">
            Sınıflarım ve Kodlar
          </a>{" "}
          ekranından kod üretin.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 pr-4 font-medium">Ad</th>
                <th className="pb-2 pr-4 font-medium">Tür</th>
                <th className="pb-2 font-medium">Kod</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-overlay/5">
              {codes.map((c) => (
                <tr key={c.code} className="text-content">
                  <td className="py-2.5 pr-4">
                    <span className="flex items-center gap-2">
                      <GraduationCap
                        size={15}
                        className={c.role === ROLES.STUDENT ? "text-accent" : "text-muted"}
                        aria-hidden="true"
                      />
                      {c.displayName}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-muted">
                    {c.role === ROLES.STUDENT ? "Öğrenci" : "Veli"}
                  </td>
                  <td className="py-2.5 font-mono text-accent">{c.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
