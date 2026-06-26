"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  ThumbsUp,
  CircleHelp,
  ThumbsDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
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

interface ShortlistEntry {
  id: number;
  candidate: string;
  branch: string;
  score: number;
  recommendation: CvReviewResult["recommendation"];
}

/**
 * Öğretmen CV AI İnceleme — MVP (demo-safe).
 * Sezgisel analiz ile anında ön değerlendirme + çoklu aday kısa listesi/sıralama.
 * Gerçek AI sonraki faz. Hiçbir şey yazmaz (yalnızca tarayıcı belleği).
 */
export function CvReviewStudio() {
  const t = useT();
  const [candidate, setCandidate] = useState<string>("");
  const [branch, setBranch] = useState<string>(COMMON_BRANCHES[1]);
  const [years, setYears] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [result, setResult] = useState<CvReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [nextId, setNextId] = useState(1);

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

  const fillSample = () => {
    setCandidate(t("hiring.sample.candidate"));
    setBranch(t("hiring.sample.branch"));
    setYears(t("hiring.sample.years"));
    setText(t("hiring.sample.text"));
    setResult(null);
    setError(null);
  };

  const addToShortlist = () => {
    if (!result) return;
    setShortlist((prev) =>
      [
        ...prev,
        {
          id: nextId,
          candidate: candidate.trim() || t("hiring.shortlist.anonymous"),
          branch: branch.trim(),
          score: result.score,
          recommendation: result.recommendation,
        },
      ].sort((a, b) => b.score - a.score),
    );
    setNextId((n) => n + 1);
  };

  const removeEntry = (id: number) =>
    setShortlist((prev) => prev.filter((e) => e.id !== id));

  const rec = result ? REC_STYLE[result.recommendation] : null;
  const RecIcon = rec?.icon;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Giriş */}
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">{t("hiring.header.title")}</h2>
            <button
              type="button"
              onClick={fillSample}
              className="ml-auto inline-flex items-center gap-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-content"
            >
              <Sparkles size={13} aria-hidden="true" /> {t("hiring.sample.fill")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="candidate"
              label={t("hiring.field.candidate")}
              placeholder={t("hiring.field.candidatePlaceholder")}
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
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

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs text-muted">
                  {result.branchMatch
                    ? t("hiring.result.branchMatchYes")
                    : t("hiring.result.branchMatchNo")}
                </span>
                <button
                  type="button"
                  onClick={addToShortlist}
                  className="inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent transition hover:bg-accent/20"
                >
                  <Plus size={13} aria-hidden="true" /> {t("hiring.addToShortlist")}
                </button>
              </div>

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

      {/* Kısa liste — sıralı aday tablosu */}
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Users size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("hiring.shortlist.title")}</h2>
          <span className="text-xs text-muted">
            {t("hiring.shortlist.count", { count: shortlist.length })}
          </span>
          {shortlist.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <DataExportButtons
                filename="aday-kisa-listesi"
                title={t("hiring.shortlist.exportTitle")}
                formats={["pdf", "csv"]}
                columns={[
                  { key: "candidate", label: t("hiring.shortlist.col.candidate") },
                  { key: "branch", label: t("hiring.shortlist.col.branch") },
                  { key: "score", label: t("hiring.shortlist.col.score") },
                  { key: "recommendationLabel", label: t("hiring.shortlist.col.recommendation") },
                ]}
                rows={shortlist.map((e) => ({
                  candidate: e.candidate,
                  branch: e.branch,
                  score: e.score,
                  recommendationLabel: t(`hiring.rec.${e.recommendation}`),
                }))}
              />
              <button
                type="button"
                onClick={() => setShortlist([])}
                className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-brand"
              >
                <Trash2 size={13} aria-hidden="true" /> {t("hiring.shortlist.clear")}
              </button>
            </div>
          )}
        </div>

        {shortlist.length === 0 ? (
          <p className="text-sm text-muted">{t("hiring.shortlist.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-overlay/10 text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3 font-medium">{t("hiring.shortlist.col.rank")}</th>
                  <th className="py-2 pr-3 font-medium">{t("hiring.shortlist.col.candidate")}</th>
                  <th className="py-2 pr-3 font-medium">{t("hiring.shortlist.col.branch")}</th>
                  <th className="py-2 pr-3 font-medium">{t("hiring.shortlist.col.score")}</th>
                  <th className="py-2 pr-3 font-medium">{t("hiring.shortlist.col.recommendation")}</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {shortlist.map((e, i) => (
                  <tr key={e.id} className="border-b border-overlay/[0.06]">
                    <td className="py-2.5 pr-3 text-muted">{i + 1}</td>
                    <td className="py-2.5 pr-3 font-medium text-content">{e.candidate}</td>
                    <td className="py-2.5 pr-3 text-muted">{e.branch}</td>
                    <td className={`py-2.5 pr-3 font-bold ${scoreColor(e.score)}`}>{e.score}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs ${REC_STYLE[e.recommendation].cls}`}
                      >
                        {t(`hiring.rec.${e.recommendation}`)}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => removeEntry(e.id)}
                        className="text-muted transition hover:text-brand"
                        aria-label={t("hiring.shortlist.remove")}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
