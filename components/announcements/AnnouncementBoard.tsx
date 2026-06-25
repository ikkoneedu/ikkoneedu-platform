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
  listAnnouncements,
  type Announcement,
} from "@/lib/services/announcements";
import { listMyClasses, type ClassRecord } from "@/lib/services/access-codes";
import { createNotification, notifyClassMembers } from "@/lib/services/notifications";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { useT } from "@/components/i18n/LocaleProvider";

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

/**
 * Duyuru panosu — tüm tenant üyeleri okur; personel yeni duyuru yazar.
 * `readOnly` verildiğinde (veli/öğrenci paneli) yayınlama formu hiç gösterilmez,
 * kim bakarsa baksın salt-okunur kalır.
 */
export function AnnouncementBoard({ readOnly = false }: { readOnly?: boolean }) {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canPost =
    !readOnly &&
    profile != null &&
    (STAFF_ROLES as readonly string[]).includes(profile.role);
  const isTeacher = profile?.role === ROLES.TEACHER;

  const [items, setItems] = useState<Announcement[] | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setItems(await listAnnouncements(tenantId));
      // Öğretmen kendi sınıflarına hedefli duyuru yayınlayabilsin diye yükle.
      if (canPost && isTeacher && user) {
        setClasses(await listMyClasses(tenantId, user.uid));
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, canPost, isTeacher, user]);

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
    const classId = String(data.get("classId") ?? "").trim();
    if (!title || !body) return;

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
        // Sınıf seçildiyse yalnızca o sınıfa hedeflenir; boşsa tüm okul.
        targetClassIds: classId ? [classId] : [],
      });
      // Bildirim merkezine düşür (best-effort — başarısız olsa da duyuru kaydedildi).
      const className = classes.find((c) => c.id === classId)?.name;
      try {
        await createNotification(tenantId, {
          title: `Yeni duyuru: ${title}`,
          body,
          audience: className ? `${className} (sınıf + velileri)` : "Tüm okul",
          createdBy: user.uid,
          createdByName: profile?.displayName ?? "Yetkili",
        });
        // Sınıf hedefliyse o sınıfın öğrenci+velisine kişiye özel bildirim.
        if (classId) {
          await notifyClassMembers(tenantId, classId, {
            title: `Yeni duyuru: ${title}`,
            body,
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

  return (
    <div className="flex flex-col gap-6">
      {canPost && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">{t("boardA.ann.compose.heading")}</h2>
          </div>
          <form onSubmit={handlePost} className="space-y-3">
            <TextField label={t("boardA.ann.title.label")} name="title" placeholder={t("boardA.ann.title.placeholder")} required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ann-body" className="text-sm font-medium text-muted">
                {t("boardA.ann.body.label")}
              </label>
              <textarea
                id="ann-body"
                name="body"
                rows={3}
                required
                placeholder={t("boardA.ann.body.placeholder")}
                className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {isTeacher && classes.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">{t("boardA.ann.target.label")}</label>
                <select
                  name="classId"
                  defaultValue=""
                  className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="" className="bg-surface">{t("boardA.ann.target.allSchool")}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">
                      {t("boardA.ann.target.classOption", { name: c.name })}
                    </option>
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
                {t("boardA.ann.posted")}
              </p>
            )}
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Send size={16} aria-hidden="true" />
              {busy ? t("boardA.ann.submit.busy") : t("boardA.ann.submit.idle")}
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("boardA.ann.list.heading")}</h2>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted">{t("boardA.ann.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4"
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
