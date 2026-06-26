import { Award, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PreviewBadge } from "@/components/shared/PreviewBadge";
import { sampleResult, bursRules } from "@/lib/scholarship-exam-mock-data";

/**
 * Sonuç ve Burs Hesaplama.
 * Ders netleri, toplam puan/sıralama, burs kuralları ve AI notu.
 */
export function ScholarshipResultEngine() {
  const maxNet = Math.max(...sampleResult.nets.map((n) => n.net));

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Award size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sonuç ve Burs Hesaplama</h2>
        <PreviewBadge ai className="ml-auto" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Öğrenci sonucu */}
        <div className="rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-5">
          <p className="text-sm font-semibold text-content">{sampleResult.studentName}</p>
          <p className="text-xs text-muted">{sampleResult.campus}</p>

          <div className="mt-4 space-y-3">
            {sampleResult.nets.map((item) => (
              <div key={item.subject}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-content">{item.subject}</span>
                  <span className="text-muted">{item.net} net</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-overlay/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent/40 to-accent"
                    style={{ width: `${(item.net / maxNet) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-overlay/[0.04] px-3 py-2">
              <p className="text-xs text-muted">Toplam Puan</p>
              <p className="text-lg font-bold text-content">{sampleResult.totalScore}</p>
            </div>
            <div className="rounded-xl bg-overlay/[0.04] px-3 py-2">
              <p className="text-xs text-muted">Sıralama</p>
              <p className="text-lg font-bold text-content">{sampleResult.rank}.</p>
            </div>
            <div className="rounded-xl bg-overlay/[0.04] px-3 py-2">
              <p className="text-xs text-muted">Yüzdelik</p>
              <p className="text-lg font-bold text-content">{sampleResult.percentile}</p>
            </div>
            <div className="rounded-xl bg-accent/10 px-3 py-2">
              <p className="text-xs text-accent">Burs Oranı</p>
              <p className="text-lg font-bold text-content">{sampleResult.award}</p>
            </div>
          </div>
        </div>

        {/* Burs kuralları */}
        <div className="rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Burs Kuralları
          </p>
          <ul className="space-y-2">
            {bursRules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center justify-between rounded-lg bg-overlay/[0.03] px-3 py-2 text-sm"
              >
                <span className="text-content">{rule.label}</span>
                <span className="font-medium text-accent">{rule.award}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI notu */}
      <div className="ai-gradient mt-5 rounded-2xl border border-accent/20 p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent">
          <Sparkles size={13} aria-hidden="true" />
          AI Notu
        </p>
        <p className="mt-2 text-sm text-content">{sampleResult.aiNote}</p>
      </div>
    </GlassCard>
  );
}
