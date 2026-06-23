"use client";

import { useState, type FormEvent } from "react";
import {
  IdCard,
  Hash,
  Search,
  CheckCircle2,
  CalendarDays,
  Clock,
  MapPin,
  DoorOpen,
  Armchair,
  QrCode,
  FileDown,
  AlertCircle,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { RealSchoolShell } from "@/components/school/RealSchoolShell";
import { printToPDF, htmlTable } from "@/lib/export/download";
import {
  getPublicAdmissionCard,
  type PublicAdmissionCard,
} from "@/lib/services/scholarship-applications";

/**
 * Gerçek okul (tenant) için HALKA AÇIK sınav giriş belgesi sorgulama.
 * Başvuru numarası + doğrulayıcı (TC) ile sorgular; belge sunucu route'undan
 * (Admin SDK, doğrulamalı) okunur. /school/[slug]/scholarship/admission-card,
 * statik mock okul bulamazsa bunu kullanır.
 */
export function RealSchoolScholarshipAdmissionCard({ slug }: { slug: string }) {
  return (
    <RealSchoolShell slug={slug}>
      {(school) => <Lookup tenantId={school.id} schoolName={school.name} />}
    </RealSchoolShell>
  );
}

function Lookup({ tenantId, schoolName }: { tenantId: string; schoolName: string }) {
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState<PublicAdmissionCard | null>(null);
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
    setCard(null);
    setNotFound(false);
    try {
      const c = await getPublicAdmissionCard(tenantId, applicationNo, tc);
      if (c) setCard(c);
      else setNotFound(true);
    } catch {
      setError("Sorgulama yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  };

  const infoItems = card
    ? [
        { id: "exam", icon: QrCode, label: "Sınav", value: card.examName || schoolName },
        { id: "date", icon: CalendarDays, label: "Tarih", value: card.examDate || "—" },
        { id: "time", icon: Clock, label: "Saat", value: card.examTime || "—" },
        { id: "campus", icon: MapPin, label: "Kampüs", value: card.campus || "—" },
        { id: "room", icon: DoorOpen, label: "Salon", value: card.room || "—" },
        { id: "seat", icon: Armchair, label: "Sıra", value: card.seatNo || "—" },
      ]
    : [];

  const downloadPdf = () => {
    if (!card) return;
    const table = htmlTable(
      [{ label: "Bilgi" }, { label: "Değer" }],
      infoItems.map((i) => [i.label, i.value]),
    );
    printToPDF(
      "Sınav Giriş Belgesi",
      `<h1>Sınav Giriş Belgesi</h1><p class="meta">Aday: <strong>${card.studentName}</strong> · Başvuru No: <strong>${card.applicationNo}</strong></p>${table}`,
    );
  };

  return (
    <>
      <SectionHeader
        align="center"
        eyebrow={schoolName}
        title="Sınav Giriş Belgesi"
        description="TC Kimlik No ve başvuru numaranızla sınav giriş belgenizi görüntüleyin."
        className="mb-10"
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <GlassCard tone="navy">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="TC Kimlik No"
              name="tc"
              icon={IdCard}
              inputMode="numeric"
              maxLength={11}
              placeholder="11 haneli"
              required
            />
            <TextField
              label="Başvuru No"
              name="applicationNo"
              icon={Hash}
              placeholder="IKK-2027-000000"
              required
            />
            <div className="sm:col-span-2">
              <PrimaryButton type="submit" size="lg" className="w-full" disabled={busy}>
                <Search size={18} aria-hidden="true" />
                {busy ? "Sorgulanıyor..." : "Belgeyi Görüntüle"}
              </PrimaryButton>
            </div>
          </form>

          {error && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
              <AlertCircle size={16} aria-hidden="true" />
              {error}
            </p>
          )}
          {notFound && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
              <AlertCircle size={16} aria-hidden="true" />
              Kayıt bulunamadı veya doğrulama bilgisi hatalı.
            </p>
          )}
        </GlassCard>

        {card && (
          <GlassCard tone="navy">
            <div className="flex flex-col gap-1 border-b border-white/10 pb-5">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <CheckCircle2 size={14} aria-hidden="true" />
                Sınav Giriş Belgesi
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-content">
                {card.studentName}
              </h3>
              <p className="text-sm text-muted">Başvuru No: {card.applicationNo}</p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted">{item.label}</p>
                      <p className="truncate text-sm font-semibold text-content">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <PrimaryButton type="button" size="md" className="w-full" onClick={downloadPdf}>
                <FileDown size={18} aria-hidden="true" />
                PDF İndir / Yazdır
              </PrimaryButton>
            </div>
          </GlassCard>
        )}
      </div>
    </>
  );
}
