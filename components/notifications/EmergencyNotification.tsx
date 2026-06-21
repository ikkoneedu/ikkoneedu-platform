"use client";

import { useRef, useState, type FormEvent } from "react";
import { Siren, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { SelectField } from "@/components/shared/SelectField";
import { Toggle } from "@/components/settings/Toggle";

interface EmergencyNotificationProps {
  recipientGroups: string[];
}

/**
 * Acil Bildirim Modu — işlevsel.
 * Onaylı gönderim akışı: doğrulama + kullanıcı onayı + yerel kayıt (outbox).
 * Gerçek yüksek öncelikli push/SMS yayını için FCM/SMS gateway gerekir.
 */
export function EmergencyNotification({ recipientGroups }: EmergencyNotificationProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [done, setDone] = useState<{ title: string; group: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(formRef.current!);
    const title = String(f.get("title") ?? "").trim();
    const body = String(f.get("body") ?? "").trim();
    const group = String(f.get("group") ?? "");
    if (!title || !body) {
      setError("Acil başlık ve mesaj zorunludur.");
      return;
    }
    if (!window.confirm(`Acil bildirim "${title}" → ${group} grubuna hazırlanacak. Onaylıyor musunuz?`)) {
      return;
    }
    setError(null);
    try {
      const outbox = JSON.parse(localStorage.getItem("ikkoneedu:emergency-outbox") || "[]");
      outbox.unshift({ title, body, group, priority: "high", createdAt: new Date().toISOString() });
      localStorage.setItem("ikkoneedu:emergency-outbox", JSON.stringify(outbox.slice(0, 50)));
    } catch {
      /* yoksay */
    }
    setDone({ title, group });
    formRef.current?.reset();
  };

  return (
    <GlassCard className="border-brand/30 bg-brand/[0.06]">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand/30 bg-brand/15 text-brand">
          <Siren size={18} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-content">Acil Bildirim</h2>
        <span className="ml-auto rounded-full border border-brand/30 bg-brand/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
          Yüksek Öncelik
        </span>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-muted">
        Servis gecikmesi, okul kapanışı, güvenlik duyurusu veya acil
        bilgilendirmeler için yüksek öncelikli bildirim gönderimi.
      </p>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField label="Acil Başlık" name="title" placeholder="Acil bildirim başlığı" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-muted">Acil Mesaj</label>
            <textarea
              name="body"
              rows={3}
              placeholder="Acil mesajı yazın..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <SelectField label="Hedef Grup" name="group" items={recipientGroups} />
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <span className="text-sm text-content">SMS ile Destekle</span>
            <Toggle defaultOn label="SMS ile destekle" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-brand" />
          Push önceliği: Yüksek
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
            <AlertCircle size={15} aria-hidden="true" /> {error}
          </p>
        )}

        {done ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-3 text-sm text-content">
            <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
            Acil bildirim hazırlandı: <strong>{done.title}</strong> → {done.group}
          </div>
        ) : (
          <PrimaryButton type="submit" size="lg" className="mt-4 w-full bg-brand hover:bg-brand/90 sm:w-fit">
            <Siren size={18} aria-hidden="true" />
            Acil Bildirim Gönder
          </PrimaryButton>
        )}
      </form>
    </GlassCard>
  );
}
