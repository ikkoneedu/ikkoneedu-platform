"use client";

import { useState, type FormEvent } from "react";
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import { createLead } from "@/lib/services/leads";

const leadSourceOptions = [
  "Web Sitesi",
  "Telefon",
  "WhatsApp",
  "Referans",
  "Sosyal Medya",
  "Etkinlik",
];

/**
 * Yeni Lead Ekle — CRM hızlı kayıt kartı.
 * Firestore `createLead` servisine bağlıdır. Firebase env yoksa mock modda
 * çalışır (Firestore'a yazmaz) ve yine başarı mesajı gösterir.
 */
export function NewLeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await createLead({
      fullName: String(data.get("fullName") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      source: String(data.get("source") ?? ""),
      note: String(data.get("note") ?? ""),
    });

    setSubmitting(false);
    if (result.ok) {
      setSuccess(true);
      form.reset();
    } else {
      setError("Lead kaydedilemedi. Lütfen tekrar deneyin.");
    }
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <UserPlus size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Yeni Lead Ekle</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Ad Soyad" name="fullName" placeholder="Aday veli" required />
          <TextField label="Telefon" name="phone" type="tel" placeholder="0 5xx xxx xx xx" required />
          <TextField label="E-posta" name="email" type="email" placeholder="ornek@eposta.com" />
          <SelectField label="Kaynak" name="source" items={leadSourceOptions} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-note" className="text-sm font-medium text-muted">
            Not
          </label>
          <textarea
            id="lead-note"
            name="note"
            rows={3}
            placeholder="Görüşme notu, ilgi alanı vb."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {success && (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle2 size={16} aria-hidden="true" />
            Lead başarıyla eklendi.
          </p>
        )}
        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        <PrimaryButton type="submit" size="md" className="w-full" disabled={submitting}>
          <UserPlus size={16} aria-hidden="true" />
          {submitting ? "Kaydediliyor..." : "Lead Ekle"}
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
