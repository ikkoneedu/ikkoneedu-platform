"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  ThumbsUp,
  CircleHelp,
  ThumbsDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useT } from "@/components/i18n/LocaleProvider";
import {
  reviewCv,
  COMMON_BRANCHES,
  type CvReviewResult,
} from "@/lib/hiring/cv-review";

const REC_STYLE = {
  invite: { cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", icon: ThumbsUp },
  consider: { cls: "border-amber-400/30 bg-amber-400/10 text-amber-300", icon: CircleHelp },
  reject: { cls: "border-brand/30 bg-brand/10 text-brand", icon: ThumbsDown },
} as const;

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-300";
  if (score >= 45) return "text-amber-300";
  return "text-brand";
}

/**
 * Öğretmen CV AI İnceleme — MVP (demo-safe).
 * Sezgisel analiz ile anında ön değerlendirme üretir; gerçek AI sonraki faz.
 */
export function CvReviewStudio() {
  const t = useT();
  const [branch, setBranch] = useState<string>(COMMON_BRANCHES[1]);
  const [years, setYears] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [result, setResult] = useState<CvReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    if (!text.trim()) {
      setError(t("hiring.err.textRequired"));
      setResult(null);
      return;
    }
    setError(null);
    const parsedYears = Number.parseInt(years, 10);
    setResult(
      reviewCv({
        branch,
        text,
        years: Number.isFinite(parsedYears) ? parsedYears : undefined,
      }),
    );
  };

  const rec = result ? REC_STYLE[result.recommendation] : null;
  const RecIcon = rec?.icon;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Giriş */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("hiring.header.title")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="candidate"
            label={t("hiring.field.candidate")}
            placeholder={t("hiring.field.candidatePlaceholder")}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="branch" className="text-sm font-medium text-muted">
              {t("hiring.field.branch")}
            </label>
            <input
              id="branch"
              list="branch-options"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <datalist id="branch-options">
              {COMMON_BRANCHES.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            name="years"
            label={t("hiring.field.years")}
            type="number"
            min={0}
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="cvtext" className="text-sm font-medium text-muted">
            {t("hiring.field.text")}
          </label>
          <textarea
            id="cvtext"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("hiring.field.textPlaceholder")}
            className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content placeholder:text-muted/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        {error && <p className="mt-3 text-sm text-brand">{error}</p>}

        <PrimaryButton type="button" size="lg" className="mt-5 w-full sm:w-fit" onClick={run}>
          <ClipboardCheck size={18} aria-hidden="true" />
          {t("hiring.review")}
        </PrimaryButton>
      </GlassCard>

      {/* Sonuç */}
      <GlassCard tone="navy" className="flex flex-col">
        {!result ? (
          <p className="text-sm text-muted">{t("hiring.result.empty")}</p>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Skor + öneri */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-muted">
                  {t("hiring.result.score")}
                </span>
                <span className={`text-4xl font-bold ${scoreColor(result.score)}`}>
                  {result.score}
                  <span className="text-base text-muted">/100</span>
                </span>
              </div>
              {rec && RecIcon && (
                <span
                  className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${rec.cls}`}
                >
                  <RecIcon size={15} aria-hidden="true" />
                  {t(`hiring.rec.${result.recommendation}`)}
                </span>
              )}
            </div>

            <span className="w-fit rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs text-muted">
              {result.branchMatch
                ? t("hiring.result.branchMatchYes")
                : t("hiring.result.branchMatchNo")}
            </span>

            {/* Güçlü yönler */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                {t("hiring.result.strengths")}
              </p>
              {result.strengths.length === 0 ? (
                <p className="text-sm text-muted">{t("hiring.result.noStrengths")}</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {result.strengths.map((k) => (
                    <li key={k} className="flex items-center gap-2 text-sm text-content">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-400" aria-hidden="true" />
                      {t(`hiring.signal.${k}`)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Eksikler */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                {t("hiring.result.gaps")}
              </p>
              {result.gaps.length === 0 ? (
                <p className="text-sm text-muted">{t("hiring.result.noGaps")}</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {result.gaps.map((k) => (
                    <li key={k} className="flex items-center gap-2 text-sm text-content">
                      <AlertTriangle size={15} className="shrink-0 text-amber-400" aria-hidden="true" />
                      {t(`hiring.signal.${k}`)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
