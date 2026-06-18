"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";

interface DemoRequestFormProps {
  institutionTypes: string[];
}

/**
 * Demo Talep Formu — mock gönderim.
 * Gerçek bir backend/CRM gönderimi yoktur; gönderince başarı durumu gösterilir.
 */
export function DemoRequestForm({ institutionTypes }: DemoRequestFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <GlassCard tone="navy" className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          <CheckCircle2 size={28} aria-hidden="true" />
        </span>
        <h3 className="text-xl font-bold tracking-tight text-content">
          Talebiniz alındı!
        </h3>
        <p className="max-w-sm text-sm text-muted">
          Uzman ekibimiz en kısa sürede sizinle iletişime geçerek okulunuza özel
          bir demo planlayacak.
        </p>
        <PrimaryButton variant="secondary" size="md" onClick={() => setSubmitted(false)}>
          Yeni Talep Oluştur
        </PrimaryButton>
      </GlassCard>
    );
  }

  return (
    <GlassCard tone="navy">
      <h2 className="text-xl font-bold tracking-tight text-content">Demo Talep Formu</h2>
      <p className="mt-1 text-sm text-muted">
        Bilgilerinizi paylaşın, size özel bir demo planlayalım.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Kurum Adı" name="institution" placeholder="Örnek Koleji" required />
          <TextField label="Yetkili Adı Soyadı" name="fullname" placeholder="Ad Soyad" required />
          <TextField label="Görevi" name="role" placeholder="Müdür, Kurucu vb." />
          <TextField label="Telefon" name="phone" type="tel" placeholder="0 5xx xxx xx xx" required />
          <TextField label="E-Posta" name="email" type="email" placeholder="ornek@okul.com" required />
          <TextField label="Şehir" name="city" placeholder="İstanbul" />
          <SelectField label="Kurum Türü" items={institutionTypes} />
          <TextField label="Öğrenci Sayısı" name="students" type="number" placeholder="500" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium text-muted">
            Mesajınız
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="İhtiyaçlarınızı kısaca paylaşın..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/[0.04] accent-accent"
          />
          <span>KVKK metnini okudum ve kabul ediyorum.</span>
        </label>

        <PrimaryButton type="submit" size="lg" className="w-full" disabled={!accepted}>
          <Send size={18} aria-hidden="true" />
          Demo Talebi Gönder
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
