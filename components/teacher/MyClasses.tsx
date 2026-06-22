"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  School,
  RefreshCw,
  AlertCircle,
  Inbox,
  ChevronDown,
  Users,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { getClass, type SchoolClass } from "@/lib/services/classes";
import { getStudent, type StudentRecord } from "@/lib/services/students";

/**
 * Öğretmen Portalı — öğretmenin bağlı sınıfları + öğrencileri (gerçek Firestore).
 * Kapsam profilden: `profile.classIds`. Öğrenci listesi sınıf açıldığında çekilir.
 */
export function MyClasses() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isTeacher = profile?.role === ROLES.TEACHER;
  const classIds = useMemo(() => profile?.classIds ?? [], [profile?.classIds]);
  const usable = firebaseReady && Boolean(tenantId) && isTeacher;

  const [classes, setClasses] = useState<SchoolClass[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [roster, setRoster] = useState<Record<string, StudentRecord[]>>({});

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    setError(null);
    try {
      const records = (
        await Promise.all(classIds.map((id) => getClass(tenantId, id)))
      ).filter((c): c is SchoolClass => c !== null);
      setClasses(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sınıflar yüklenemedi.");
    } finally {
      setRefreshing(false);
    }
  }, [tenantId, classIds]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  const toggle = async (cls: SchoolClass) => {
    if (openId === cls.id) {
      setOpenId(null);
      return;
    }
    setOpenId(cls.id);
    if (!roster[cls.id] && tenantId) {
      try {
        const students = (
          await Promise.all(cls.studentIds.map((sid) => getStudent(tenantId, sid)))
        ).filter((s): s is StudentRecord => s !== null);
        setRoster((prev) => ({ ...prev, [cls.id]: students }));
      } catch {
        setRoster((prev) => ({ ...prev, [cls.id]: [] }));
      }
    }
  };

  if (!usable) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <School size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sınıflarım</h2>
        {classes && <span className="text-xs text-muted">{classes.length}</span>}
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

      {classes === null ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : classes.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" />
          Size atanmış sınıf yok. Okul yönetimi sınıf atadığında burada görünür.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {classes.map((c) => {
            const open = openId === c.id;
            const students = roster[c.id];
            return (
              <li key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => void toggle(c)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-content">{c.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {c.grade ? `${c.grade}. kademe · ` : ""}
                      <Users size={11} className="mr-0.5 inline" aria-hidden="true" />
                      {c.studentIds.length} öğrenci
                    </span>
                  </span>
                </button>
                {open && (
                  <div className="border-t border-white/10 px-4 py-3">
                    {students === undefined ? (
                      <p className="text-sm text-muted">Yükleniyor…</p>
                    ) : students.length === 0 ? (
                      <p className="text-sm text-muted">Bu sınıfta öğrenci kaydı yok.</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {students.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-sm"
                          >
                            <span className="text-content">{s.fullName}</span>
                            {s.studentNo && (
                              <span className="text-xs text-muted">· {s.studentNo}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
