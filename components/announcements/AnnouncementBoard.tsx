"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Megaphone, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  createAnnouncement,
  listAnnouncementsForCurrentUser,
  type AnnouncementRecord,
} from "@/lib/services/announcements";
import { listMyClasses, type ClassRecord } from "@/lib/services/access-codes";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES = [
  ROLES.TEACHER,
  ROLES.COORDINATOR,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.PR,
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.SUPER_ADMIN,
] as const;

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface AnnouncementBoardProps {
  readOnly?: boolean;
}

/**
 * Duyuru panosu — tüm tenant üyeleri okur; personel yeni duyuru yazar.
 * Yalnızca giriş yapmış kullanıcı + Firebase aktifken görünür.
 */
export function AnnouncementBoard({ readOnly = false }: AnnouncementBoardProps) {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canPost =
    !readOnly &&
    profile != null &&
    (STAFF_ROLES as readonly string[]).includes(profile.role);

  const [items, setItems] = useState<AnnouncementRecord[] | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const refresh = useCallback(async () => {
    if (!tenantId || !profile) return;
    try {
      setItems(
        await listAnnouncementsForCurrentUser(
          tenantId,
          profile.role,
          profile.classId,
        ),
      );
      if (profile.role === ROLES.TEACHER && user) {
        setClasses(await listMyClasses(tenantId, user.uid));
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, profile, user]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const handlePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !user || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const body = String(data.get("body") ?? "").trim();
    const targetMode = String(data.get("targetMode") ?? "school");
    const targetClassId = String(data.get("targetClassId") ?? "").trim();
    if (!title || !body) return;
    if (profile?.role === ROLES.TEACHER && classes.length > 0 && !targetClassId) {
      setError("Öğretmen duyurusu için hedef sınıf seçin.");
      return;
    }

    const selectedClass = classes.find((c) => c.id === targetClassId);
    const teacherTargets =
      targetMode === "parents"
        ? [ROLES.PARENT]
        : [ROLES.STUDENT, ROLES.PARENT];

    setBusy(true);
    setError(null);
    setPosted(false);
    try {
      await createAnnouncement({
        tenantId,
        authorUid: user.uid,
        authorName: profile?.displayName ?? "Yetkili",
        title,
        body,
        targetRoles:
          profile?.role === ROLES.TEACHER
            ? teacherTargets
            : targetMode === "parents"
              ? [ROLES.PARENT]
              : [],
        targetClassIds:
          profile?.role === ROLES.TEACHER && selectedClass
            ? [selectedClass.id]
            : [],
      });
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

  return (
    <div className="flex flex-col gap-6">
      {canPost && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Duyuru Yayınla</h2>
          </div>
          <form onSubmit={handlePost} className="space-y-3">
            <TextField label="Başlık" name="title" placeholder="Duyuru başlığı" required />
            {profile.role === ROLES.TEACHER && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">Hedef</label>
                  <select
                    name="targetMode"
                    defaultValue="class"
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="class" className="bg-surface">
                      Sınıf + veliler
                    </option>
                    <option value="parents" className="bg-surface">
                      Sadece veliler
                    </option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted">Sınıf</label>
                  <select
                    name="targetClassId"
                    defaultValue={classes[0]?.id ?? ""}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    {classes.length === 0 ? (
                      <option value="" className="bg-surface">
                        Sınıf bulunamadı
                      </option>
                    ) : (
                      classes.map((c) => (
                        <option key={c.id} value={c.id} className="bg-surface">
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ann-body" className="text-sm font-medium text-muted">
                İçerik
              </label>
              <textarea
                id="ann-body"
                name="body"
                rows={3}
                required
                placeholder="Duyuru metni…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                <AlertCircle size={16} aria-hidden="true" />
                {error}
              </p>
            )}
            {posted && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} aria-hidden="true" />
                Duyuru yayınlandı.
              </p>
            )}
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Send size={16} aria-hidden="true" />
              {busy ? "Yayınlanıyor…" : "Yayınla"}
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Duyurular</h2>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted">Henüz duyuru yok.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-content">{a.title}</h3>
                  <span className="shrink-0 text-xs text-muted">
                    {formatDate(a.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{a.body}</p>
                {a.authorName && (
                  <p className="mt-2 text-xs text-muted/70">— {a.authorName}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
