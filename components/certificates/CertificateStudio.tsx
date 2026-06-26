"use client";

import { useState } from "react";
import { Award, Printer, FileBadge } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useT } from "@/components/i18n/LocaleProvider";
import { printToPDF } from "@/lib/export/download";
import {
  CERTIFICATE_TYPES,
  buildSerial,
  buildVerifyPayload,
  type CertificateInput,
} from "@/lib/certificates/certificate";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sertifika & Belge Üretici — MVP (demo-safe).
 * Bilgilerden QR doğrulamalı belge önizlemesi üretir; yazdırma için branded
 * print penceresi açar. Gerçek imza doğrulaması sonraki faz. Yazma yok.
 */
export function CertificateStudio() {
  const t = useT();
  const [data, setData] = useState<CertificateInput>({
    type: "achievement",
    recipient: "",
    title: "",
    date: "",
    issuer: "",
    note: "",
  });
  const [doc, setDoc] = useState<CertificateInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CertificateInput>(key: K, value: CertificateInput[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const generate = () => {
    if (!data.recipient.trim() || !data.title.trim()) {
      setError(t("cert.err.required"));
      setDoc(null);
      return;
    }
    setError(null);
    setDoc({ ...data });
  };

  const serial = doc ? buildSerial(doc) : "";

  const print = () => {
    if (!doc) return;
    const typeLabel = t(`cert.type.${doc.type}`);
    const body = `
      <div style="text-align:center;border:2px solid #0A2342;border-radius:16px;padding:40px 32px;margin-top:8px">
        <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#D62839;font-weight:700">${escapeHtml(typeLabel)}</div>
        <div style="margin-top:18px;font-size:14px;color:#667">${escapeHtml(t("cert.doc.awardedTo"))}</div>
        <div style="margin-top:8px;font-size:30px;font-weight:800;color:#0A2342">${escapeHtml(doc.recipient)}</div>
        <div style="margin-top:16px;font-size:14px;color:#667">${escapeHtml(t("cert.doc.presentedFor"))}</div>
        <div style="margin-top:6px;font-size:20px;font-weight:600;color:#0A2342">${escapeHtml(doc.title)}</div>
        ${doc.note ? `<div style="margin-top:10px;font-size:13px;color:#556;font-style:italic">${escapeHtml(doc.note)}</div>` : ""}
        <div style="margin-top:28px;display:flex;justify-content:space-between;align-items:flex-end;font-size:12px;color:#556">
          <div style="text-align:left">
            <div><strong>${escapeHtml(t("cert.doc.issuedBy"))}:</strong> ${escapeHtml(doc.issuer)}</div>
            <div><strong>${escapeHtml(t("cert.doc.date"))}:</strong> ${escapeHtml(doc.date)}</div>
          </div>
          <div style="text-align:right">
            <div><strong>${escapeHtml(t("cert.doc.serial"))}:</strong> ${escapeHtml(serial)}</div>
            <div style="color:#889">${escapeHtml(t("cert.doc.verify"))}</div>
          </div>
        </div>
      </div>`;
    printToPDF(typeLabel, body);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <FileBadge size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("cert.header.title")}</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cert-type" className="text-sm font-medium text-muted">
              {t("cert.field.type")}
            </label>
            <select
              id="cert-type"
              value={data.type}
              onChange={(e) => set("type", e.target.value as CertificateInput["type"])}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            >
              {CERTIFICATE_TYPES.map((ct) => (
                <option key={ct} value={ct} className="bg-surface">
                  {t(`cert.type.${ct}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="recipient"
              label={t("cert.field.recipient")}
              placeholder={t("cert.field.recipientPlaceholder")}
              value={data.recipient}
              onChange={(e) => set("recipient", e.target.value)}
            />
            <TextField
              name="date"
              label={t("cert.field.date")}
              placeholder={t("cert.field.datePlaceholder")}
              value={data.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>

          <TextField
            name="title"
            label={t("cert.field.title")}
            placeholder={t("cert.field.titlePlaceholder")}
            value={data.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <TextField
            name="issuer"
            label={t("cert.field.issuer")}
            placeholder={t("cert.field.issuerPlaceholder")}
            value={data.issuer}
            onChange={(e) => set("issuer", e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cert-note" className="text-sm font-medium text-muted">
              {t("cert.field.note")}
            </label>
            <textarea
              id="cert-note"
              rows={2}
              value={data.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder={t("cert.field.notePlaceholder")}
              className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-brand">{error}</p>}

        <PrimaryButton type="button" size="lg" className="mt-5 w-full sm:w-fit" onClick={generate}>
          <Award size={18} aria-hidden="true" />
          {t("cert.generate")}
        </PrimaryButton>
      </GlassCard>

      {/* Önizleme */}
      <GlassCard tone="navy" className="flex flex-col">
        {!doc ? (
          <p className="text-sm text-muted">{t("cert.result.empty")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border-2 border-accent/30 bg-overlay/[0.03] p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                {t(`cert.type.${doc.type}`)}
              </p>
              <p className="mt-4 text-xs text-muted">{t("cert.doc.awardedTo")}</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-content">
                {doc.recipient}
              </p>
              <p className="mt-3 text-xs text-muted">{t("cert.doc.presentedFor")}</p>
              <p className="mt-1 text-lg font-semibold text-content">{doc.title}</p>
              {doc.note && <p className="mt-2 text-sm italic text-muted">{doc.note}</p>}

              <div className="mt-6 flex items-end justify-between gap-4 text-left text-xs text-muted">
                <div>
                  <p>
                    <span className="font-semibold text-content">{t("cert.doc.issuedBy")}:</span>{" "}
                    {doc.issuer || "—"}
                  </p>
                  <p>
                    <span className="font-semibold text-content">{t("cert.doc.date")}:</span>{" "}
                    {doc.date || "—"}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-accent">{serial}</p>
                </div>
                <div className="shrink-0 rounded-lg bg-white p-1.5">
                  <QRCodeSVG
                    value={buildVerifyPayload(serial, doc)}
                    size={72}
                    level="M"
                    marginSize={0}
                    aria-label={t("cert.doc.verify")}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={print}
              className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-2 text-sm text-content transition hover:border-accent/40"
            >
              <Printer size={16} aria-hidden="true" /> {t("cert.print")}
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
