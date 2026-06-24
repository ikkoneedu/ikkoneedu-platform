"use client";

import { useState, type FormEvent } from "react";
import {
  IdCard,
  Hash,
  Search,
  QrCode,
  CheckCircle2,
  CalendarDays,
  Clock,
  MapPin,
  DoorOpen,
  Armchair,
  FileDown,
  MessageSquare,
  Mail,
  MapPinned,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { printToPDF, htmlTable } from "@/lib/export/download";
import {
  activeExam,
  sampleResult,
  examRules,
  requiredDocuments,
} from "@/lib/scholarship-exam-mock-data";

/**
 * Sınav Giriş Belgesi sorgulama — halka açık (aday veli) mock.
 * Belge taranabilir GERÇEK bir QR kod taşır (salonda doğrulama). PDF/SMS/e-posta
 * gönderimi henüz yoktur; TC + Başvuru No ile belge gösterilir.
 */
export function AdmissionCardLookup() {
  const [shown, setShown] = useState(false);
  const [applicationNo, setApplicationNo] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setApplicationNo(String(data.get("applicationNo") ?? "").trim());
    setShown(true);
  };

  // QR içeriği — salonda hızlı doğrulama için belge kimliği (başvuru no + aday +
  // sınav/tarih/salon/sıra). Makine okunur, tek satır.
  const qrPayload = [
    `IKK-ADMISSION`,
    applicationNo || "—",
    sampleResult.studentName,
    activeExam.name,
    activeExam.examDate,
    "Salon A",
    "A-12",
  ].join("|");

  const [copied, setCopied] = useState(false);

  const infoItems = [
    { id: "exam", icon: QrCode, label: "Sınav", value: activeExam.name },
    {
      id: "date",
      icon: CalendarDays,
      label: "Tarih",
      value: activeExam.examDate,
    },
    { id: "time", icon: Clock, label: "Saat", value: activeExam.examTime },
    { id: "campus", icon: MapPin, label: "Kampüs", value: sampleResult.campus },
    { id: "room", icon: DoorOpen, label: "Salon", value: "Salon A" },
    { id: "seat", icon: Armchair, label: "Sıra", value: "A-12" },
  ];

  const cardText = () =>
    `Sınav Giriş Belgesi\nAday: ${sampleResult.studentName}\n` +
    infoItems.map((i) => `${i.label}: ${i.value}`).join("\n");

  const downloadPdf = () => {
    const table = htmlTable(
      [{ label: "Bilgi" }, { label: "Değer" }],
      infoItems.map((i) => [i.label, i.value]),
    );
    const rules = `<h3>Sınav Kuralları</h3><ul>${examRules
      .map((r) => `<li>${r}</li>`)
      .join("")}</ul>`;
    const docs = `<h3>Gerekli Belgeler</h3><ul>${requiredDocuments
      .map((d) => `<li>${d}</li>`)
      .join("")}</ul>`;
    printToPDF(
      "Sınav Giriş Belgesi",
      `<h1>Sınav Giriş Belgesi</h1><p class="meta">Aday: <strong>${sampleResult.studentName}</strong></p>${table}<div style="margin-top:20px;display:flex;gap:32px;flex-wrap:wrap">${rules}${docs}</div>`,
    );
  };

  const sendEmail = () => {
    const subject = encodeURIComponent("Sınav Giriş Belgesi");
    const body = encodeURIComponent(cardText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(cardText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sorgulama formu */}
      <GlassCard tone="navy">
        <h2 className="text-lg font-bold tracking-tight text-content">
          Giriş Belgesi Sorgulama
        </h2>
        <p className="mt-1 text-sm text-muted">
          TC Kimlik No ve Başvuru Numaranız ile sınav giriş belgenizi
          görüntüleyin.
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
              Belgeyi Görüntüle
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>

      {/* Belge kartı */}
      {shown && (
        <GlassCard tone="navy">
          <div className="flex flex-col gap-1 border-b border-white/10 pb-5">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <CheckCircle2 size={14} aria-hidden="true" />
              Sınav Giriş Belgesi
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-content">
              {sampleResult.studentName}
            </h3>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            {/* QR kod — salonda hızlı doğrulama (gerçek, taranabilir) */}
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG
                  value={qrPayload}
                  size={128}
                  level="M"
                  marginSize={0}
                  aria-label="Sınav giriş belgesi QR kodu"
                />
              </div>
              <p className="flex items-center gap-1 text-xs text-muted">
                <QrCode size={13} aria-hidden="true" />
                Salonda doğrulama için okutun
              </p>
            </div>
          </div>

          {/* Sınav kuralları */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h4 className="text-sm font-semibold text-content">
                Sınav Kuralları
              </h4>
              <ul className="mt-3 space-y-2">
                {examRules.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-2 text-sm text-muted"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h4 className="text-sm font-semibold text-content">
                Gerekli Belgeler
              </h4>
              <ul className="mt-3 space-y-2">
                {requiredDocuments.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-start gap-2 text-sm text-muted"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Harita / yol tarifi placeholder */}
          <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-10 text-muted">
            <MapPinned size={28} className="text-accent" aria-hidden="true" />
            <p className="text-sm">Harita yakında</p>
          </div>

          {/* Eylemler */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PrimaryButton type="button" size="md" className="w-full" onClick={downloadPdf}>
              <FileDown size={18} aria-hidden="true" />
              PDF İndir / Yazdır
            </PrimaryButton>
            <PrimaryButton
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={copyDetails}
            >
              <MessageSquare size={18} aria-hidden="true" />
              {copied ? "Kopyalandı" : "Bilgileri Kopyala"}
            </PrimaryButton>
            <PrimaryButton
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={sendEmail}
            >
              <Mail size={18} aria-hidden="true" />
              E-posta Gönder
            </PrimaryButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
