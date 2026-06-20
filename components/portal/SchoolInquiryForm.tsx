"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2, AlertCircle, X } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { createSchoolInquiry } from "@/lib/services/demo-requests";

interface SchoolInquiryFormProps {
  schoolName: string;
  /** Talebin yazılacağı okul (tenant) kimliği. */
  tenantId: string;
  /** Üstte kapatma düğmesi göstermek için (opsiyonel). */
  onClose?: () => void;
}

/**
 * Aday velinin bir okula gönderdiği bilgi/iletişim talebi formu.
 * Talep `tenants/{tenantId}/demoRequests` altına yazılır (halka açık oluşturma)
 * ve okulun CRM gelen kutusunda görünür.
 */
export function SchoolInquiryForm({
  schoolName,
  tenantId,
  onClose,
}: SchoolInquiryFormProps) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const grade = String(data.get("grade") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!fullName || phone.length < 7) {
      setError("Lütfen ad soyad ve geçerli bir telefon girin.");
      return;
    }

    setBusy(true);
    setError(null);
    const result = await createSchoolInquiry(tenantId, {
      schoolName,
      fullName,
      phone,
      email,
      grade,
      message,
    });
    setBusy(false);
    if (result.ok) {
      setDone(true);
    } else {
      setError("Talebiniz gönderilemedi. Lütfen biraz sonra tekrar deneyin.");
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-center">
        <CheckCircle2 size={22} className="text-emerald-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-content">Talebiniz iletildi</p>
        <p className="text-xs text-muted">
          {schoolName} en kısa sürede sizinle iletişime geçecek.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-xs font-medium text-accent hover:underline"
          >
            Kapat
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Bilgi Talebi
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted transition hover:text-content"
            aria-label="Kapat"
          >
            <X size={15} />
          </button>
        )}
      </div>
      <TextField label="Ad Soyad" name="fullName" placeholder="Ad Soyad" required />
      <TextField label="Telefon" name="phone" type="tel" placeholder="0 5xx xxx xx xx" required />
      <TextField label="E-posta" name="email" type="email" placeholder="ornek@eposta.com" />
      <TextField label="İlgilenilen Sınıf" name="grade" placeholder="Ör. 5. sınıf" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`msg-${tenantId}`} className="text-sm font-medium text-muted">
          Mesaj
        </label>
        <textarea
          id={`msg-${tenantId}`}
          name="message"
          rows={3}
          placeholder="Sormak istedikleriniz…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-content placeholder:text-muted/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>
      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs text-brand">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}
      <PrimaryButton type="submit" size="sm" className="w-full" disabled={busy}>
        <Send size={15} aria-hidden="true" />
        {busy ? "Gönderiliyor…" : "Gönder"}
      </PrimaryButton>
    </form>
  );
}
