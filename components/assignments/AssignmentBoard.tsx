"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ClipboardList, Send, AlertCircle, CheckCircle2, CalendarClock } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  createAssignment,
  listAssignments,
  type Assignment,
} from "@/lib/services/assignments";
import { listMyClasses, type ClassRecord } from "@/lib/services/access-codes";
import { createNotification, notifyClassMembers } from "@/lib/services/notifications";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES = [
  ROLES.TEACHER,
  ROLES.COORDINATOR,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.SUPER_ADMIN,
] as const;

/**
 * Ödev panosu — personel ödev verir; öğrenci/veli kendi sınıfının ödevlerini görür.
 * Yalnızca giriş yapmış kullanıcı + Firebase aktifken görünür.
 */
export function AssignmentBoard({ readOnly = false }: { readOnly?: boolean }) {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isStaff =
    profile != null && (STAFF_ROLES as readonly string[]).includes(profile.role);
  const isTeacher = profile?.role === ROLES.TEACHER;
  // Veli/öğrenci paneli (readOnly): ödev verme formu hiç gösterilmez.
  const canCompose = !readOnly && isStaff;

  const [items, setItems] = useState<Assignment[] | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setItems(await listAssignments(tenantId));
      if (isTeacher && user) {
        setClasses(await listMyClasses(tenantId, user.uid));
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, isTeacher, user]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const handlePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !user || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const dueDate = String(data.get("dueDate") ?? "").trim();
    const classId = String(data.get("classId") ?? "").trim() || undefined;
    const className = classes.find((c) => c.id === classId)?.name;
    if (!title || !description) return;

    setBusy(true);
    setError(null);
    setPosted(false);
    try {
      await createAssignment({
        tenantId,
        authorUid: user.uid,
        authorName: profile?.displayName ?? "Öğretmen",
        title,
        description,
        dueDate,
        classId,
        className,
      });
      // Bildirim merkezine düşür (best-effort).
      try {
        await createNotification(tenantId, {
          title: `Yeni ödev: ${title}`,
          body: dueDate ? `${description}\nSon tarih: ${dueDate}` : description,
          audience: className ? `${className}` : "Tüm okul",
          createdBy: user.uid,
          createdByName: profile?.displayName ?? "Öğretmen",
        });
        // Sınıf hedefliyse o sınıfın öğrenci+velisine kişiye özel bildirim.
        if (classId) {
          await notifyClassMembers(tenantId, classId, {
            title: `Yeni ödev: ${title}`,
            body: dueDate ? `Son tarih: ${dueDate}` : description,
            type: "announcement",
            link: "/notifications",
          });
        }
      } catch {
        /* bildirim best-effort */
      }
      form.reset();
      setPosted(true);
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || !tenantId || items === null) return null;

  // Öğrenci/veli yalnızca kendi sınıfının (veya okul geneli) ödevlerini görür.
  const myClassId = profile.classId;
  const visible = isStaff
    ? items
    : items.filter((a) => !a.classId || a.classId === myClassId);

  return (
    <div className="flex flex-col gap-6">
      {canCompose && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Ödev Ver</h2>
          </div>
          <form onSubmit={handlePost} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField label="Başlık" name="title" placeholder="Ödev başlığı" required />
              <TextField label="Son Tarih" name="dueDate" type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="asg-desc" className="text-sm font-medium text-muted">
                Açıklama
              </label>
              <textarea
                id="asg-desc"
                name="description"
                rows={3}
                required
                placeholder="Ödev detayları…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {isTeacher && classes.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Sınıf (opsiyonel)</label>
                <select
                  name="classId"
                  defaultValue=""
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="" className="bg-surface">Tüm okul</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                <AlertCircle size={16} aria-hidden="true" />
                {error}
              </p>
            )}
            {posted && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} aria-hidden="true" />
                Ödev yayınlandı.
              </p>
            )}
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Send size={16} aria-hidden="true" />
              {busy ? "Yayınlanıyor…" : "Ödev Ver"}
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Ödevler</h2>
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-muted">Henüz ödev yok.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((a) => (
              <li key={a.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-content">{a.title}</h3>
                  {a.dueDate && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-amber-400">
                      <CalendarClock size={13} aria-hidden="true" />
                      {a.dueDate}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{a.description}</p>
                <p className="mt-2 text-xs text-muted/70">
                  {a.className ? `${a.className} · ` : "Tüm okul · "}
                  {a.authorName}
                </p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
