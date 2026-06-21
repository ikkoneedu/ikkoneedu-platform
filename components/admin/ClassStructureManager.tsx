"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Layers, Plus, Trash2, AlertCircle, GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listClasses,
  generateBranches,
  deleteClass,
  type SchoolClass,
} from "@/lib/services/classes";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

/**
 * Sınıf yapısı yöneticisi — kademe + şube sayısı modeli.
 *
 * Gerçek okul örneği: 1. sınıf 4 şube, 2. sınıf 5 şube, 3. sınıf 4 şube,
 * 4. sınıf 7 şube. Yönetici kademe ve şube sayısını girer; sistem
 * `1-A…1-D`, `2-A…2-E` gibi şubeleri otomatik üretir. Ders programı bunlara
 * bağlanır.
 */
export function ClassStructureManager() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canManage =
    profile != null && MANAGER_ROLES.includes(profile.role);

  const [classes, setClasses] = useState<SchoolClass[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setClasses(await listClasses(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const grade = String(data.get("grade") ?? "").trim();
    const count = Number(data.get("count") ?? 0);
    if (!grade || count < 1) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const created = await generateBranches(tenantId, grade, count);
      setNotice(
        created > 0
          ? `${grade}. kademe için ${created} şube oluşturuldu.`
          : `${grade}. kademe şubeleri zaten mevcut.`,
      );
      form.reset();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!tenantId || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteClass(tenantId, id);
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /** Kademeye göre grupla. */
  const grouped = useMemo(() => {
    const map = new Map<string, SchoolClass[]>();
    for (const c of classes ?? []) {
      const list = map.get(c.gradeLevel) ?? [];
      list.push(c);
      map.set(c.gradeLevel, list);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "tr", { numeric: true }),
    );
  }, [classes]);

  if (!firebaseReady || !profile || !tenantId) return null;

  if (!canManage) {
    return (
      <GlassCard tone="navy">
        <p className="text-sm text-muted">
          Sınıf yapısını yalnızca okul yöneticileri düzenleyebilir.
        </p>
      </GlassCard>
    );
  }

  const exportRows = (classes ?? []).map((c) => ({
    kademe: c.gradeLevel,
    sube: c.branch,
    ad: c.name,
  }));

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Layers size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">
            Kademe ve Şube Oluştur
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          Her kademe için şube sayısını girin; sistem şubeleri (ör.{" "}
          <span className="font-mono text-accent">1-A … 1-D</span>) otomatik
          üretir. Farklı kademeler farklı sayıda şubeye sahip olabilir.
        </p>
        <form
          onSubmit={handleGenerate}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end"
        >
          <TextField
            label="Kademe (sınıf seviyesi)"
            name="grade"
            placeholder="1"
            required
          />
          <TextField
            label="Şube sayısı"
            name="count"
            type="number"
            min={1}
            max={26}
            placeholder="4"
            required
          />
          <PrimaryButton type="submit" size="md" disabled={busy}>
            <Plus size={16} aria-hidden="true" />
            Şubeleri Üret
          </PrimaryButton>
        </form>
        {notice && (
          <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            {notice}
          </p>
        )}
        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </p>
        )}
      </GlassCard>

      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <GraduationCap size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Sınıf Yapısı</h2>
          {classes && classes.length > 0 && (
            <span className="text-xs text-muted">
              {classes.length} sınıf · {grouped.length} kademe
            </span>
          )}
          {classes && classes.length > 0 && (
            <DataExportButtons
              className="ml-auto"
              filename="sinif-yapisi"
              title="Sınıf Yapısı"
              columns={[
                { key: "kademe", label: "Kademe" },
                { key: "sube", label: "Şube" },
                { key: "ad", label: "Sınıf" },
              ]}
              rows={exportRows}
            />
          )}
        </div>

        {classes === null ? (
          <p className="text-sm text-muted">Yükleniyor…</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-muted">
            Henüz sınıf yok. Yukarıdan kademe ve şube sayısı girerek başlayın.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map(([grade, list]) => (
              <div key={grade}>
                <h3 className="mb-2 text-sm font-semibold text-accent">
                  {grade}. Kademe · {list.length} şube
                </h3>
                <div className="flex flex-wrap gap-2">
                  {list.map((c) => (
                    <span
                      key={c.id}
                      className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-content"
                    >
                      <span className="font-medium">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => void handleDelete(c.id)}
                        disabled={busy}
                        aria-label={`${c.name} sınıfını sil`}
                        className="text-muted transition-colors hover:text-brand"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
