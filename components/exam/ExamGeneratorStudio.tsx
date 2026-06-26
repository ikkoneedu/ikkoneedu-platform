"use client";

import { useState } from "react";
import { FileQuestion, RefreshCw, Printer, Eye, EyeOff } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useT } from "@/components/i18n/LocaleProvider";
import { printToPDF } from "@/lib/export/download";
import {
  EXAM_SUBJECTS,
  EXAM_DIFFICULTIES,
  generateQuiz,
  type ExamSubject,
  type ExamDifficulty,
  type QuizQuestion,
} from "@/lib/exam/generate";

const LETTERS = ["A", "B", "C", "D", "E"];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * AI Sınav Oluşturucu — çalışan demo (gerçek AI üretimi sonraki faz).
 * Çoktan seçmeli quiz üretir; yazdırma için branded print penceresi. Yazma yok.
 */
export function ExamGeneratorStudio() {
  const t = useT();
  const [subject, setSubject] = useState<ExamSubject>("math");
  const [difficulty, setDifficulty] = useState<ExamDifficulty>("easy");
  const [count, setCount] = useState(5);
  const [seed, setSeed] = useState(1);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const build = (s: number) => {
    setQuestions(generateQuiz({ subject, count, difficulty, seed: s }));
  };
  const generate = () => {
    setSeed(1);
    build(1);
  };
  const regenerate = () => {
    const next = seed + 1;
    setSeed(next);
    build(next);
  };

  const print = () => {
    if (!questions) return;
    const title = `${t(`exam.subject.${subject}`)} · ${t(`exam.diff.${difficulty}`)}`;
    const qHtml = questions
      .map(
        (q, i) => `
        <div style="margin:0 0 14px;page-break-inside:avoid">
          <div style="font-weight:600;color:#0A2342">${i + 1}. ${escapeHtml(q.prompt)}</div>
          <div style="margin-top:4px;color:#334;font-size:13px">
            ${q.options.map((o, j) => `${LETTERS[j]}) ${escapeHtml(o)}`).join("&nbsp;&nbsp;&nbsp;")}
          </div>
        </div>`,
      )
      .join("");
    const key = questions
      .map((q, i) => `${i + 1}-${LETTERS[q.correctIndex]}`)
      .join("&nbsp;&nbsp; ");
    const body = `
      <h2 style="color:#0A2342;margin:0 0 12px">${escapeHtml(title)}</h2>
      ${qHtml}
      <div style="margin-top:24px;border-top:1px solid #e5e7eb;padding-top:10px;font-size:12px;color:#556">
        <strong>${escapeHtml(t("exam.answerKey"))}:</strong> ${key}
      </div>`;
    printToPDF(title, body);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Ayarlar */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <FileQuestion size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("exam.header.title")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exam-subject" className="text-sm font-medium text-muted">
              {t("exam.field.subject")}
            </label>
            <select
              id="exam-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value as ExamSubject)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            >
              {EXAM_SUBJECTS.map((s) => (
                <option key={s} value={s} className="bg-surface">
                  {t(`exam.subject.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exam-diff" className="text-sm font-medium text-muted">
              {t("exam.field.difficulty")}
            </label>
            <select
              id="exam-diff"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ExamDifficulty)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            >
              {EXAM_DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="bg-surface">
                  {t(`exam.diff.${d}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exam-count" className="text-sm font-medium text-muted">
              {t("exam.field.count")}
            </label>
            <input
              id="exam-count"
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number.parseInt(e.target.value, 10) || 1)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            />
          </div>
        </div>

        <PrimaryButton type="button" size="lg" className="mt-5 w-full sm:w-fit" onClick={generate}>
          <FileQuestion size={18} aria-hidden="true" />
          {t("exam.generate")}
        </PrimaryButton>
      </GlassCard>

      {/* Sonuç */}
      {!questions ? (
        <GlassCard tone="navy">
          <p className="text-sm text-muted">{t("exam.result.empty")}</p>
        </GlassCard>
      ) : (
        <GlassCard tone="navy">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-content">
              {t(`exam.subject.${subject}`)} · {t(`exam.diff.${difficulty}`)}
            </h3>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAnswers((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-content"
              >
                {showAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
                {showAnswers ? t("exam.hideAnswers") : t("exam.showAnswers")}
              </button>
              <button
                type="button"
                onClick={regenerate}
                className="inline-flex items-center gap-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-content"
              >
                <RefreshCw size={13} /> {t("exam.regenerate")}
              </button>
              <button
                type="button"
                onClick={print}
                className="inline-flex items-center gap-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-content"
              >
                <Printer size={13} /> {t("exam.print")}
              </button>
            </div>
          </div>

          <ol className="flex flex-col gap-4">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4">
                <p className="font-medium text-content">
                  {i + 1}. {q.prompt}
                </p>
                <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {q.options.map((opt, j) => {
                    const isCorrect = showAnswers && j === q.correctIndex;
                    return (
                      <span
                        key={j}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${
                          isCorrect
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                            : "border-overlay/10 bg-overlay/[0.02] text-content"
                        }`}
                      >
                        <span className="mr-1.5 font-semibold text-muted">{LETTERS[j]})</span>
                        {opt}
                      </span>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>
      )}
    </div>
  );
}
