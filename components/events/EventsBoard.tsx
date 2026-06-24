"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarDays, MapPin, Send, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { createEvent, deleteEvent, listEvents, type EventRecord } from "@/lib/services/events";
import { createNotification } from "@/lib/services/notifications";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES: string[] = [
  ROLES.TEACHER, ROLES.COORDINATOR, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
  ROLES.PR, ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.SUPER_ADMIN,
];

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", weekday: "long" }).format(d);
}

/**
 * Etkinlik takvimi — GERÇEK Firestore. Personel etkinlik ekler; tüm tenant
 * üyeleri görür. Tenant izole. `readOnly` ile oluşturma formu gizlenir.
 */
export function EventsBoard({ readOnly = false }: { readOnly?: boolean }) {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canCreate = !readOnly && profile != null && STAFF_ROLES.includes(profile.role);

  const [items, setItems] = useState<EventRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setItems(await listEvents(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const handleDelete = async (id: string) => {
    if (!tenantId) return;
    try {
      await deleteEvent(tenantId, id);
      setItems((prev) => prev?.filter((x) => x.id !== id) ?? prev);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId || !user || busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const date = String(data.get("date") ?? "").trim();
    const location = String(data.get("location") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    if (!title || !date) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await createEvent({
        tenantId, authorUid: user.uid, authorName: profile?.displayName ?? "Yetkili",
        title, date, location, description,
      });
      try {
        await createNotification(tenantId, {
          title: `Yeni etkinlik: ${title}`,
          body: location ? `${date} · ${location}` : date,
          audience: "Tüm okul",
          createdBy: user.uid,
          createdByName: profile?.displayName ?? "Yetkili",
        });
      } catch {
        /* bildirim best-effort */
      }
      form.reset();
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || !tenantId || items === null) {
    return (
      <GlassCard tone="navy">
        <p className="py-8 text-center text-sm text-muted">Yükleniyor…</p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {canCreate && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Etkinlik Ekle</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField label="Başlık" name="title" placeholder="Bahar Şenliği" required />
              <TextField label="Tarih" name="date" type="date" required />
            </div>
            <TextField label="Yer" name="location" placeholder="Ana Kampüs / Konferans Salonu" />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ev-desc" className="text-sm font-medium text-muted">Açıklama</label>
              <textarea
                id="ev-desc" name="description" rows={3} placeholder="Etkinlik detayları…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
                <AlertCircle size={16} aria-hidden="true" />{error}
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} aria-hidden="true" />Etkinlik eklendi.
              </p>
            )}
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Send size={16} aria-hidden="true" />{busy ? "Ekleniyor…" : "Ekle"}
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Etkinlik Takvimi</h2>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted">Henüz etkinlik yok.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((ev) => (
              <li key={ev.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-content">{ev.title}</h3>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {fmtDate(ev.date)}
                    </span>
                    {canCreate && (
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        aria-label="Etkinliği sil"
                        className="text-muted transition-colors hover:text-brand"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
                {ev.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <MapPin size={12} aria-hidden="true" />{ev.location}
                  </p>
                )}
                {ev.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{ev.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
