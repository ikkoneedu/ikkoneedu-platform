"use client";

import { useState } from "react";
import { Sparkles, Copy, FileText, Save, Wand2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

interface GeneratedCommentProps {
  /** Varsayılan olarak gösterilen örnek karne yorumu. */
  defaultComment: string;
}

/**
 * Oluşturulan Karne Yorumu — client bileşeni.
 *
 * "AI ile Yorum Oluştur" butonu mock üretim yapar (useState). Kopyala,
 * PDF önizle ve öğretmen notlarına kaydet eylemleri de mock'tur.
 * Gerçek AI/PDF entegrasyonu yoktur.
 */
export function GeneratedComment({ defaultComment }: GeneratedCommentProps) {
  const [comment, setComment] = useState(defaultComment);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setStatus(null);
    // Mock üretim: kısa bir gecikmeden sonra örnek yorum yeniden yazılır.
    window.setTimeout(() => {
      setComment(defaultComment);
      setGenerating(false);
      setStatus("Yeni yorum AI tarafından oluşturuldu.");
    }, 700);
  };

  const handleAction = (message: string) => {
    setStatus(message);
  };

  return (
    <GlassCard className="ai-gradient flex h-full flex-col border-accent/20">
      <div className="mb-5 flex items-center gap-2">
        <Wand2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">
          Oluşturulan Karne Yorumu
        </h2>
      </div>

      <div className="flex-1 rounded-xl border border-white/10 bg-navy/40 p-4">
        {generating ? (
          <p className="animate-pulse text-sm text-muted">
            AI yorum oluşturuyor...
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-content">{comment}</p>
        )}
      </div>

      {status && (
        <p className="mt-3 text-xs font-medium text-accent">{status}</p>
      )}

      <PrimaryButton
        size="lg"
        className="mt-5 w-full"
        onClick={handleGenerate}
        disabled={generating}
      >
        <Sparkles size={18} aria-hidden="true" />
        {generating ? "Oluşturuluyor..." : "AI ile Yorum Oluştur"}
      </PrimaryButton>

      <div className="mt-3 flex flex-wrap gap-3">
        <PrimaryButton
          variant="secondary"
          size="sm"
          onClick={() => handleAction("Yorum panoya kopyalandı.")}
        >
          <Copy size={15} aria-hidden="true" />
          Yorumu Kopyala
        </PrimaryButton>
        <PrimaryButton
          variant="secondary"
          size="sm"
          onClick={() => handleAction("PDF önizlemesi hazırlanıyor (mock).")}
        >
          <FileText size={15} aria-hidden="true" />
          PDF Önizle
        </PrimaryButton>
        <PrimaryButton
          variant="secondary"
          size="sm"
          onClick={() => handleAction("Yorum öğretmen notlarına kaydedildi.")}
        >
          <Save size={15} aria-hidden="true" />
          Öğretmen Notlarına Kaydet
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}
