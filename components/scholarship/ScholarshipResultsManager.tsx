"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Search, Save, AlertCircle, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listScholarshipApplications,
  setScholarshipResult,
  publishScholarshipResult,
  type ScholarshipApplicationRecord,
} from "@/lib/services/scholarship-applications";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

/**
 * Bursluluk Sonuç Yönetimi (yönetici) — GERÇEK Firestore.
 * Başvuruları listeler, arar; sınav puanı + burs oranı + salon/sıra girer.
 * Sonuç kaydedilince başvuru durumu "result_published" olur. Tenant izole.
 */
export function ScholarshipResultsManager() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canManage =
    profile != null && STAFF_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canManage;

  const [apps, setApps] = useState<ScholarshipApplicationRecord[] | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Record<string, { examScore: string; scholarshipRate: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    try {
      const list = await listScholarshipApplications(tenantId);
      setApps(list);
      setError(null);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (apps ?? []).filter(
      (a) =>
        !q ||
        a.studentName.toLowerCase().includes(q) ||
        a.applicationNo.toLowerCase().includes(q) ||
        a.parentName.toLowerCase().includes(q),
    );
  }, [apps, search]);

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="text-sm text-muted">
          <p className="font-semibold text-content">Sonuç yönetimi kullanılamıyor</p>
          <p className="mt-1">
            Bu bölüm yalnızca giriş yapmış bir okul yöneticisi hesabıyla ve
            Firebase aktifken çalışır.
          </p>
        </div>
      </GlassCard>
    );
  }

  const getDraft = (a: ScholarshipApplicationRecord) =>
    draft[a.id] ?? { examScore: a.examScore, scholarshipRate: a.scholarshipRate };

  const setDraftField = (id: string, field: "examScore" | "scholarshipRate", value: string, base: ScholarshipApplicationRecord) => {
    setDraft((d) => ({
      ...d,
      [id]: { ...(d[id] ?? { examScore: base.examScore, scholarshipRate: base.scholarshipRate }), [field]: value },
    }));
  };

  const save = async (a: ScholarshipApplicationRecord) => {
    if (!tenantId || savingId) return;
    const dr = getDraft(a);
    setSavingId(a.id);
    setError(null);
    try {
      await setScholarshipResult(tenantId, a.id, {
        examScore: dr.examScore,
        scholarshipRate: dr.scholarshipRate,
      });
      // Veli/aday başvuru numarasıyla sorgulayabilsin diye public sonucu yayımla.
      if (a.applicationNo) {
        await publishScholarshipResult(tenantId, {
          applicationNo: a.applicationNo,
          studentName: a.studentName,
          examScore: dr.examScore,
          scholarshipRate: dr.scholarshipRate,
          status: "result_published",
          room: a.room,
          seatNo: a.seatNo,
        });
      }
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ClipboardList size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bursluluk Sonuç Yönetimi (canlı)</h2>
        <span className="text-xs text-muted">{apps?.length ?? 0} başvuru</span>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
          aria-label="Yenile"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
        {(apps?.length ?? 0) > 0 && (
          <DataExportButtons
            filename="bursluluk-sonuclari"
            title="Bursluluk Sonuçları"
            columns={[
              { key: "applicationNo", label: "Başvuru No" },
              { key: "studentName", label: "Öğrenci" },
              { key: "parentPhone", label: "Telefon" },
              { key: "examScore", label: "Puan" },
              { key: "scholarshipRate", label: "Burs %" },
              { key: "status", label: "Durum" },
            ]}
            rows={(apps ?? []) as unknown as Record<string, unknown>[]}
          />
        )}
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={15} aria-hidden="true" /> {error}
        </p>
      )}

      <div className="relative mb-4 max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Öğrenci, veli veya başvuru no ara…"
          className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-content placeholder:text-muted/60 outline-none focus:border-accent"
        />
      </div>

      {apps === null ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {apps.length === 0 ? "Henüz başvuru yok." : "Aramayla eşleşen başvuru yok."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 pr-4 font-medium">Başvuru No</th>
                <th className="pb-2 pr-4 font-medium">Öğrenci</th>
                <th className="pb-2 pr-4 font-medium">İletişim</th>
                <th className="pb-2 pr-4 font-medium">Puan</th>
                <th className="pb-2 pr-4 font-medium">Burs %</th>
                <th className="pb-2 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((a) => {
                const dr = getDraft(a);
                return (
                  <tr key={a.id} className="text-content">
                    <td className="py-2.5 pr-4 font-mono text-xs text-accent">{a.applicationNo}</td>
                    <td className="py-2.5 pr-4">{a.studentName || "—"}</td>
                    <td className="py-2.5 pr-4 text-muted">{a.parentPhone || a.parentEmail || "—"}</td>
                    <td className="py-2.5 pr-4">
                      <input
                        value={dr.examScore}
                        onChange={(e) => setDraftField(a.id, "examScore", e.target.value, a)}
                        placeholder="0-100"
                        className="w-20 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-content outline-none focus:border-accent"
                      />
                    </td>
                    <td className="py-2.5 pr-4">
                      <input
                        value={dr.scholarshipRate}
                        onChange={(e) => setDraftField(a.id, "scholarshipRate", e.target.value, a)}
                        placeholder="%"
                        className="w-20 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-content outline-none focus:border-accent"
                      />
                    </td>
                    <td className="py-2.5">
                      <PrimaryButton
                        size="sm"
                        variant="secondary"
                        onClick={() => save(a)}
                        disabled={savingId === a.id}
                      >
                        <Save size={13} aria-hidden="true" />
                        {savingId === a.id ? "…" : "Kaydet"}
                      </PrimaryButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
