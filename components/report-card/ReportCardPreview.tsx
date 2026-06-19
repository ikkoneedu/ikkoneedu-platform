import { ScrollText } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import {
  reportPreviewInfo,
  generatedComment,
} from "@/lib/report-card-mock-data";

/**
 * Karne Önizleme — server bileşeni.
 * Oluşturulan yorumun kurumsal karne formatında önizlemesini gösterir
 * (okul başlığı, öğrenci bilgisi, ders ve yorum metni).
 */
export function ReportCardPreview() {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <ScrollText size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Karne Önizleme</h2>
      </div>

      <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        {/* Okul başlığı */}
        <div className="border-b border-white/10 pb-4 text-center">
          <h3 className="text-base font-bold text-content">
            {reportPreviewInfo.schoolName}
          </h3>
          <p className="mt-1 text-xs text-muted">
            Dönem Karnesi · {reportPreviewInfo.term}
          </p>
        </div>

        {/* Öğrenci bilgisi */}
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          <div className="flex justify-between gap-3 text-sm sm:justify-start">
            <dt className="text-muted">Öğrenci:</dt>
            <dd className="font-medium text-content">
              {reportPreviewInfo.studentName}
            </dd>
          </div>
          <div className="flex justify-between gap-3 text-sm sm:justify-start">
            <dt className="text-muted">Sınıf:</dt>
            <dd className="font-medium text-content">
              {reportPreviewInfo.classGroup}
            </dd>
          </div>
          <div className="flex justify-between gap-3 text-sm sm:justify-start">
            <dt className="text-muted">Ders:</dt>
            <dd className="font-medium text-content">
              {reportPreviewInfo.subject}
            </dd>
          </div>
        </dl>

        {/* Yorum */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Öğretmen Yorumu
          </p>
          <p className="text-sm leading-relaxed text-content">
            {generatedComment}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        Bu önizleme örnek amaçlıdır; resmî karne çıktısı kurum şablonuna göre
        biçimlendirilir.
      </p>
    </GlassCard>
  );
}
