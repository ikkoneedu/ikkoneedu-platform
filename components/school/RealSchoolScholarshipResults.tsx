"use client";

import { useState, type FormEvent } from "react";
import {
  IdCard,
  Hash,
  Search,
  Award,
  Percent,
  Trophy,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { RealSchoolShell } from "@/components/school/RealSchoolShell";
import {
  getPublicScholarshipResult,
  type PublicScholarshipResult,
} from "@/lib/services/scholarship-applications";

/**
 * Gerçek okul (tenant) için HALKA AÇIK bursluluk sonuç sorgulama.
 * Veli/aday başvuru numarasıyla sorgular; sonuç `scholarshipResults`'tan okunur.
 * /school/[slug]/scholarship/results, statik mock okul bulamazsa bunu kullanır.
 */
export function RealSchoolScholarshipResults({ slug }: { slug: string }) {
  return (
    <RealSchoolShell slug={slug}>
      {(school) => <Lookup tenantId={school.id} schoolName={school.name} />}
    </RealSchoolShell>
  );
}

function Lookup({ tenantId, schoolName }: { tenantId: string; schoolName: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PublicScholarshipResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const applicationNo = String(f.get("applicationNo") ?? "").trim();
    const tc = String(f.get("tc") ?? "").trim();
    if (!applicationNo || tc.length < 11) {
      setError("TC Kimlik No (11 hane) ve Başvuru Numarasını girin.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    setNotFound(false);
    try {
      const r = await getPublicScholarshipResult(tenantId, applicationNo, tc);
      if (r && (r.scholarshipRate || r.examScore)) setResult(r);
      else setNotFound(true);
    } catch {
      setError("Sorgulama yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  const stats = result
    ? [
        { icon: Award, label: "Toplam Puan", value: result.examScore || "—" },
        { icon: Percent, label: "Burs Oranı", value: result.scholarshipRate ? `%${result.scholarshipRate}` : "—" },
        { icon: Trophy, label: "Durum", value: "Sonuç Açıklandı" },
      ]
    : [];

  return (
    <>
      <SectionHeader
        align="center"
        eyebrow={schoolName}
        title="Bursluluk Sonuç Sorgulama"
        description="TC Kimlik No ve Başvuru Numaranız ile sınav sonucunuzu öğrenin."
        className="mb-10"
      />

      <div className="mx-auto max-w-lg">
        <GlassCard tone="navy">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="TC Kimlik No" name="tc" icon={IdCard} inputMode="numeric" maxLength={11} placeholder="11 haneli" required />
            <TextField label="Başvuru No" name="applicationNo" icon={Hash} placeholder="IKK-2027-000000" required />
            <div className="sm:col-span-2">
              <PrimaryButton type="submit" size="lg" className="w-full" disabled={busy}>
                <Search size={18} aria-hidden="true" />
                {busy ? "Sorgulanıyor…" : "Sonucu Sorgula"}
              </PrimaryButton>
            </div>
          </form>

          {error && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
              <AlertCircle size={16} aria-hidden="true" /> {error}
            </p>
          )}
          {notFound && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
              <AlertCircle size={16} aria-hidden="true" />
              Bu başvuru numarasına ait yayımlanmış sonuç bulunamadı.
            </p>
          )}
        </GlassCard>

        {result && (
          <GlassCard tone="navy" className="mt-6">
            <div className="flex flex-col gap-1 border-b border-overlay/10 pb-5">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <CheckCircle2 size={14} aria-hidden="true" /> Sınav Sonucu
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-content">{result.studentName || "—"}</h3>
              <p className="font-mono text-xs text-muted">{result.applicationNo}</p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-1 rounded-2xl border border-accent/30 bg-accent/10 px-6 py-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Kazanılan Burs Oranı</p>
              <p className="text-4xl font-bold tracking-tight text-content sm:text-5xl">
                {result.scholarshipRate ? `%${result.scholarshipRate}` : "—"}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex flex-col gap-2 rounded-xl border border-overlay/10 bg-overlay/[0.04] p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-overlay/10 bg-navy/40 text-accent">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <p className="text-xs text-muted">{s.label}</p>
                    <p className="text-lg font-bold tracking-tight text-content">{s.value}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}
      </div>
    </>
  );
}
