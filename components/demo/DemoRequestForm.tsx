"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Send, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import { HoneypotField } from "@/components/shared/HoneypotField";
import { useT } from "@/components/i18n/LocaleProvider";
import { createDemoRequest } from "@/lib/services/demo-requests";
import { demoRequestSchema } from "@/lib/validation/demo-request";
import {
  isHoneypotTriggered,
  isCooldownPassed,
  checkRateLimit,
  HONEYPOT_FIELD,
} from "@/lib/security/spam-protection";

interface DemoRequestFormProps {
  institutionTypes: string[];
}

/**
 * Demo Talep Formu.
 * Zod ile client-side doğrulama + honeypot/cooldown/rate-limit spam koruması.
 * Firestore `createDemoRequest` servisine bağlıdır. Firebase env yoksa mock
 * modda çalışır (Firestore'a yazmaz) ve yine başarı mesajı gösterir.
 */
export function DemoRequestForm({ institutionTypes }: DemoRequestFormProps) {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSubmitRef = useRef<number | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accepted || submitting) return;

    const data = new FormData(event.currentTarget);

    // 1) Honeypot — bot tuzağı.
    if (isHoneypotTriggered(data.get(HONEYPOT_FIELD))) {
      // Bota başarı gibi görün; gerçek işlem yapma.
      setSubmitted(true);
      return;
    }

    // 2) Submit cooldown — çok hızlı tekrar gönderimi engelle.
    if (!isCooldownPassed(lastSubmitRef.current)) {
      setError("Lütfen birkaç saniye sonra tekrar deneyin.");
      return;
    }

    // 3) Basit rate-limit.
    if (!checkRateLimit("demo-request").allowed) {
      setError("Çok fazla deneme yaptınız. Lütfen biraz sonra tekrar deneyin.");
      return;
    }

    // 4) Zod doğrulaması.
    const parsed = demoRequestSchema.safeParse({
      institution: String(data.get("institution") ?? ""),
      fullName: String(data.get("fullname") ?? ""),
      role: String(data.get("role") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      city: String(data.get("city") ?? ""),
      institutionType: String(data.get("institutionType") ?? ""),
      studentCount: String(data.get("students") ?? ""),
      message: String(data.get("message") ?? ""),
      company: String(data.get(HONEYPOT_FIELD) ?? ""),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Lütfen alanları kontrol edin.");
      return;
    }

    lastSubmitRef.current = Date.now();
    setSubmitting(true);
    setError(null);

    const result = await createDemoRequest({
      institution: parsed.data.institution,
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      phone: parsed.data.phone,
      email: parsed.data.email,
      city: parsed.data.city,
      institutionType: parsed.data.institutionType,
      studentCount: parsed.data.studentCount,
      message: parsed.data.message,
    });

    setSubmitting(false);
    if (result.ok) {
      setSubmitted(true);
    } else {
      setError(
        "Talebiniz şu anda gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin.",
      );
    }
  };

  if (submitted) {
    return (
      <GlassCard tone="navy" className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          <CheckCircle2 size={28} aria-hidden="true" />
        </span>
        <h3 className="text-xl font-bold tracking-tight text-content">
          Demo talebiniz alındı!
        </h3>
        <p className="max-w-sm text-sm text-muted">
          Uzman ekibimiz en kısa sürede sizinle iletişime geçerek okulunuza özel
          bir demo planlayacak.
        </p>
        <PrimaryButton
          variant="secondary"
          size="md"
          onClick={() => {
            setSubmitted(false);
            setAccepted(false);
          }}
        >
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

      <form onSubmit={handleSubmit} className="relative mt-6 space-y-4">
        <HoneypotField />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Kurum Adı" name="institution" placeholder="Örnek Koleji" required />
          <TextField label="Yetkili Adı Soyadı" name="fullname" placeholder="Ad Soyad" required />
          <TextField label="Görevi" name="role" placeholder="Müdür, Kurucu vb." />
          <TextField label="Telefon" name="phone" type="tel" placeholder="0 5xx xxx xx xx" required />
          <TextField label="E-Posta" name="email" type="email" placeholder="ornek@okul.com" required />
          <TextField label="Şehir" name="city" placeholder="İstanbul" />
          <SelectField label="Kurum Türü" name="institutionType" items={institutionTypes} />
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
            className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-overlay/20 bg-overlay/[0.04] accent-accent"
          />
          <span>KVKK metnini okudum ve kabul ediyorum.</span>
        </label>

        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </p>
        )}

        <PrimaryButton
          type="submit"
          size="lg"
          className="w-full"
          disabled={!accepted || submitting}
        >
          <Send size={18} aria-hidden="true" />
          {submitting ? "Gönderiliyor..." : "Demo Talebi Gönder"}
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}
