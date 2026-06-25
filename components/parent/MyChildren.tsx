"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, RefreshCw, AlertCircle, Inbox, GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { getStudent, type StudentRecord } from "@/lib/services/students";
import { getClass } from "@/lib/services/classes";

/**
 * Veli Portalı — bağlı öğrenciler (gerçek Firestore).
 * Kapsam profilden gelir: `profile.linkedStudentIds` (öğrenci kayıt kimlikleri).
 * Güvenlik kuralları yalnız bu öğrencilere okuma izni verir.
 */
export function MyChildren() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isParent = profile?.role === ROLES.PARENT;
  const childIds = useMemo(() => profile?.linkedStudentIds ?? [], [profile?.linkedStudentIds]);
  const usable = firebaseReady && Boolean(tenantId) && isParent;

  const [students, setStudents] = useState<StudentRecord[] | null>(null);
  const [classNames, setClassNames] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    setError(null);
    try {
      const records = (
        await Promise.all(childIds.map((id) => getStudent(tenantId, id)))
      ).filter((s): s is StudentRecord => s !== null);
      setStudents(records);
      // Sınıf adlarını çöz.
      const classIds = Array.from(
        new Set(records.map((s) => s.classId).filter(Boolean)),
      );
      const pairs = await Promise.all(
        classIds.map(async (cid) => [cid, (await getClass(tenantId, cid))?.name ?? ""] as const),
      );
      setClassNames(Object.fromEntries(pairs));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Öğrenciler yüklenemedi.");
    } finally {
      setRefreshing(false);
    }
  }, [tenantId, childIds]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Users size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Öğrencilerim</h2>
        {students && <span className="text-xs text-muted">{students.length}</span>}
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
          aria-label="Yenile"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {students === null ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : students.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" />
          Bağlı öğrenci kaydı bulunamadı. Okul yönetimi ile iletişime geçin.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {students.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-overlay/10 bg-overlay/[0.02] px-4 py-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <GraduationCap size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-content">{s.fullName}</span>
                <span className="block truncate text-xs text-muted">
                  {s.studentNo ? `No: ${s.studentNo} · ` : ""}
                  {s.grade ? `${s.grade}. kademe` : ""}
                  {s.classId ? ` · ${classNames[s.classId] || "sınıf"}` : " · sınıfsız"}
                </span>
              </span>
              <span
                className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  s.status === "active"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-overlay/15 bg-overlay/5 text-muted"
                }`}
              >
                {s.status === "active" ? "Aktif" : "Pasif"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
