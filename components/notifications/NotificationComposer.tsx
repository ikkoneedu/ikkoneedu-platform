"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  BellPlus,
  CheckCircle2,
  Eye,
  Copy,
  Save,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";

interface NotificationComposerProps {
  options: {
    recipientGroups: string[];
    types: string[];
    channels: string[];
    schedule: string[];
  };
}

interface Draft {
  title: string;
  body: string;
  recipient: string;
  type: string;
  channel: string;
  schedule: string;
}

const DRAFT_KEY = "ikkoneedu:notification-draft";

/**
 * Bildirim Oluşturucu — işlevsel.
 * Taslak kaydetme (localStorage), önizleme ve oluşturma+kopyalama gerçek çalışır.
 * Not: Gerçek push/SMS dağıtımı için FCM/SMS gateway entegrasyonu gerekir
 * (bu sürümde dağıtım yapılmaz; bildirim hazırlanır).
 */
export function NotificationComposer({ options }: NotificationComposerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<Draft | null>(null);
  const [done, setDone] = useState<Draft | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const read = (): Draft => {
    const f = new FormData(formRef.current!);
    return {
      title: String(f.get("title") ?? "").trim(),
      body: String(f.get("body") ?? "").trim(),
      recipient: String(f.get("recipient") ?? ""),
      type: String(f.get("type") ?? ""),
      channel: String(f.get("channel") ?? ""),
      schedule: String(f.get("schedule") ?? ""),
    };
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const saveDraft = () => {
    const d = read();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      flash("Taslak kaydedildi");
    } catch {
      setError("Taslak kaydedilemedi.");
    }
  };

  const showPreview = () => {
    const d = read();
    if (!d.title && !d.body) {
      setError("Önizleme için başlık veya metin girin.");
      return;
    }
    setError(null);
    setPreview(d);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = read();
    if (!d.title || !d.body) {
      setError("Lütfen başlık ve bildirim metnini girin.");
      return;
    }
    setError(null);
    try {
      const outbox = JSON.parse(localStorage.getItem("ikkoneedu:notification-outbox") || "[]");
      outbox.unshift({ ...d, createdAt: new Date().toISOString() });
      localStorage.setItem("ikkoneedu:notification-outbox", JSON.stringify(outbox.slice(0, 50)));
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* yoksay */
    }
    setDone(d);
    setPreview(null);
    formRef.current?.reset();
  };

  const copyDone = async () => {
    if (!done) return;
    try {
      await navigator.clipboard.writeText(`${done.title}\n\n${done.body}\n\n— ${done.recipient} · ${done.channel}`);
      flash("Panoya kopyalandı");
    } catch {
      /* yoksay */
    }
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <BellPlus size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bildirim Oluşturucu</h2>
        {toast && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 size={13} /> {toast}
          </span>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField label="Bildirim Başlığı" name="title" placeholder="Bildirim başlığı" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-muted">Bildirim Metni</label>
            <textarea
              name="body"
              rows={4}
              placeholder="Bildirim metnini yazın..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <SelectField label="Alıcı Grubu" name="recipient" items={options.recipientGroups} />
          <SelectField label="Bildirim Türü" name="type" items={options.types} />
          <SelectField label="Kanal" name="channel" items={options.channels} />
          <SelectField label="Gönderim Zamanı" name="schedule" items={options.schedule} />
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
            <AlertCircle size={15} aria-hidden="true" /> {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton type="button" variant="secondary" size="md" onClick={saveDraft}>
            <Save size={16} aria-hidden="true" /> Taslak Kaydet
          </PrimaryButton>
          <PrimaryButton type="button" variant="secondary" size="md" onClick={showPreview}>
            <Eye size={16} aria-hidden="true" /> Önizle
          </PrimaryButton>
          <PrimaryButton type="submit" size="md">
            <BellPlus size={16} aria-hidden="true" /> Bildirim Oluştur
          </PrimaryButton>
        </div>
      </form>

      {preview && !done && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/[0.06] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Önizleme</p>
          <p className="mt-2 text-base font-semibold text-content">{preview.title || "(başlık yok)"}</p>
          <p className="mt-1 text-sm text-muted">{preview.body || "(metin yok)"}</p>
          <p className="mt-3 text-xs text-muted/70">
            {preview.recipient} · {preview.type} · {preview.channel} · {preview.schedule}
          </p>
        </div>
      )}

      {done && (
        <div className="mt-6 flex flex-col gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-content">
              <CheckCircle2 size={15} className="text-emerald-400" /> Bildirim oluşturuldu
            </p>
            <p className="mt-0.5 text-muted">
              {done.title} → {done.recipient} · {done.channel}
            </p>
          </div>
          <div className="flex gap-2">
            <PrimaryButton type="button" variant="secondary" size="sm" onClick={copyDone}>
              <Copy size={14} aria-hidden="true" /> Kopyala
            </PrimaryButton>
            <PrimaryButton type="button" variant="secondary" size="sm" onClick={() => setDone(null)}>
              Yeni
            </PrimaryButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
