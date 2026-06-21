"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  IdCard,
  Hash,
  Search,
  Award,
  Trophy,
  Percent,
  MapPin,
  Sparkles,
  CalendarCheck,
  FileDown,
  PhoneCall,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { printToPDF, htmlTable } from "@/lib/export/download";
import { sampleResult, bursRules } from "@/lib/scholarship-exam-mock-data";

/**
 * Sonuç Sorgulama — halka açık (aday veli) mock.
 * Gerçek backend yoktur; TC + Başvuru No ile mock sonuç kartı gösterilir.
 */
export function ScholarshipResultsLookup() {
  const [shown, setShown] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShown(true);
  };

  const stats = [
    {
      id: "score",
      icon: Award,
      label: "Toplam Puan",
      value: String(sampleResult.totalScore),
    },
    {
      id: "rank",
      icon: Trophy,
      label: "Sıralama",
      value: String(sampleResult.rank),
    },
    {
      id: "percentile",
      icon: Percent,
      label: "Yüzdelik Dilim",
      value: sampleResult.percentile,
    },
    {
      id: "campus",
      icon: MapPin,
      label: "Önerilen Kampüs",
      value: sampleResult.campus,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sorgulama formu */}
      <GlassCard tone="navy">
        <h2 className="text-lg font-bold tracking-tight text-content">
          Sonuç Sorgulama
        </h2>
        <p className="mt-1 text-sm text-muted">
          TC Kimlik No ve Başvuru Numaranız ile sınav sonucunuzu görüntüleyin.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
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
            <PrimaryButton type="submit" size="lg" className="w-full">
              <Search size={18} aria-hidden="true" />
              Sonucu Sorgula
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>

      {/* Sonuç kartı */}
      {shown && (
        <GlassCard tone="navy">
          <div className="flex flex-col gap-1 border-b border-white/10 pb-5">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <Award size={14} aria-hidden="true" />
              Sınav Sonucu
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-content">
              {sampleResult.studentName}
            </h3>
          </div>

          {/* Burs oranı — büyük vurgulu */}
          <div className="mt-6 flex flex-col items-center gap-1 rounded-2xl border border-accent/30 bg-accent/10 px-6 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Kazanılan Burs Oranı
            </p>
            <p className="text-4xl font-bold tracking-tight text-content sm:text-5xl">
              {sampleResult.award}
            </p>
          </div>

          {/* İstatistikler */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-lg font-bold tracking-tight text-content">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* AI notu */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-navy/50 text-accent">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-content">
                Yapay Zeka Değerlendirmesi
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {sampleResult.aiNote}
              </p>
            </div>
          </div>

          {/* Kayıt görüşmesi CTA */}
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-6 text-center">
            <p className="text-base font-semibold text-content">
              Bursunuzu kayıt görüşmesinde değerlendirelim.
            </p>
            <p className="max-w-md text-sm text-muted">
              Size özel kayıt koşullarını konuşmak için bir görüşme planlayın.
            </p>
            <Link href="/demo" className="w-full sm:w-auto">
              <PrimaryButton size="md" className="w-full">
                <CalendarCheck size={18} aria-hidden="true" />
                Kayıt Görüşmesi Planla
              </PrimaryButton>
            </Link>
          </div>

          {/* Burs kuralları tablosu */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-left text-muted">
                  <th className="px-4 py-3 font-medium">Başarı Dilimi</th>
                  <th className="px-4 py-3 font-medium">Burs Oranı</th>
                </tr>
              </thead>
              <tbody>
                {bursRules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-4 py-3 text-content">{rule.label}</td>
                    <td className="px-4 py-3 text-muted">{rule.award}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Eylemler */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PrimaryButton
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => {
                const statsTable = htmlTable(
                  [{ label: "Bilgi" }, { label: "Değer" }],
                  [
                    ["Aday", sampleResult.studentName],
                    ["Kazanılan Burs", sampleResult.award],
                    ...stats.map((s) => [s.label, s.value] as [string, string]),
                  ],
                );
                const rulesTable = htmlTable(
                  [{ label: "Başarı Dilimi" }, { label: "Burs Oranı" }],
                  bursRules.map((r) => [r.label, r.award]),
                );
                printToPDF(
                  "Bursluluk Sınavı Sonuç Belgesi",
                  `<h1>Sınav Sonuç Belgesi</h1>${statsTable}<h3 style="margin-top:20px">Burs Oranları</h3>${rulesTable}`,
                );
              }}
            >
              <FileDown size={18} aria-hidden="true" />
              Sonuç Belgesi İndir
            </PrimaryButton>
            <a href="tel:+908502420000" className="w-full">
              <PrimaryButton type="button" variant="secondary" size="md" className="w-full">
                <PhoneCall size={18} aria-hidden="true" />
                Okulu Ara
              </PrimaryButton>
            </a>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
