import { Brain, Upload, FileText } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

interface KnowledgeBaseCardProps {
  items: string[];
}

/**
 * Kurumsal Hafıza (Okul Hafızası) kartı.
 * AI Brain'in beslendiği kurumsal doküman türlerini listeler; doküman yükleme
 * eylemi şimdilik mock'tur.
 */
export function KnowledgeBaseCard({ items }: KnowledgeBaseCardProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Brain size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Okul Hafızası</h2>
      </div>

      <p className="mb-4 text-sm text-muted">
        AI Brain, okulunuzun kurumsal belgelerinden öğrenir ve bu bilgilerle
        yanıt üretir.
      </p>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-content"
          >
            <FileText size={13} className="text-accent" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>

      <PrimaryButton variant="secondary" size="md" className="mt-6 w-full sm:w-fit">
        <Upload size={16} aria-hidden="true" />
        Doküman Yükle
      </PrimaryButton>
    </GlassCard>
  );
}
