"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, Hash } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useT } from "@/components/i18n/LocaleProvider";
import {
  SOCIAL_PLATFORMS,
  SOCIAL_POST_TYPES,
  buildHashtags,
  fillTemplate,
  variantIndex,
  type SocialPlatform,
  type SocialPostType,
} from "@/lib/social/templates";

interface Draft {
  caption: string;
  hashtags: string[];
}

/**
 * Sosyal Medya AI Stüdyo — MVP (demo-safe).
 * Hazır şablonlardan anında taslak üretir; gerçek AI sonraki fazda. Yazma yok.
 */
export function SocialStudio() {
  const t = useT();
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [postType, setPostType] = useState<SocialPostType>("event");
  const [school, setSchool] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [detail, setDetail] = useState("");
  const [seed, setSeed] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const build = (nextSeed: number) => {
    if (!topic.trim()) {
      setError(t("social.err.topicRequired"));
      setDraft(null);
      return;
    }
    setError(null);
    const idx = variantIndex(nextSeed);
    const template = t(`social.tpl.${postType}.${idx}`);
    const schoolName = school.trim() || t("social.field.school");
    const caption = fillTemplate(template, {
      school: schoolName,
      topic: topic.trim(),
      date: date.trim(),
      detail: detail.trim(),
    });
    const hashtags = buildHashtags(schoolName, postType, platform, topic.trim());
    setDraft({ caption, hashtags });
    setCopied(false);
  };

  const generate = () => {
    setSeed(0);
    build(0);
  };

  const regenerate = () => {
    const next = seed + 1;
    setSeed(next);
    build(next);
  };

  const copy = async () => {
    if (!draft) return;
    const text = `${draft.caption}\n\n${draft.hashtags.join(" ")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("social.header.title")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="platform" className="text-sm font-medium text-muted">
              {t("social.field.platform")}
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p} value={p} className="bg-surface">
                  {t(`social.platform.${p}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="postType" className="text-sm font-medium text-muted">
              {t("social.field.postType")}
            </label>
            <select
              id="postType"
              value={postType}
              onChange={(e) => setPostType(e.target.value as SocialPostType)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
            >
              {SOCIAL_POST_TYPES.map((p) => (
                <option key={p} value={p} className="bg-surface">
                  {t(`social.type.${p}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <TextField
            name="school"
            label={t("social.field.school")}
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
          <TextField
            name="topic"
            label={t("social.field.topic")}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("social.field.topicPlaceholder")}
            required
          />
          <TextField
            name="date"
            label={t("social.field.date")}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder={t("social.field.datePlaceholder")}
          />
          <TextField
            name="detail"
            label={t("social.field.detail")}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder={t("social.field.detailPlaceholder")}
          />
        </div>

        {error && <p className="mt-3 text-sm text-brand">{error}</p>}

        <PrimaryButton type="button" size="lg" className="mt-5 w-full sm:w-fit" onClick={generate}>
          <Sparkles size={18} aria-hidden="true" />
          {t("social.generate")}
        </PrimaryButton>
      </GlassCard>

      {/* Sonuç */}
      <GlassCard tone="navy" className="flex flex-col">
        <div className="mb-4 flex items-center gap-2">
          <Hash size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("social.result.caption")}</h2>
          {draft && (
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={regenerate}
                className="flex items-center gap-1 text-xs text-muted transition hover:text-content"
              >
                <RefreshCw size={13} aria-hidden="true" /> {t("social.regenerate")}
              </button>
              <button
                type="button"
                onClick={copy}
                className="flex items-center gap-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1 text-xs text-content transition hover:border-accent/40"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? t("social.copied") : t("social.copy")}
              </button>
            </div>
          )}
        </div>

        {!draft ? (
          <p className="text-sm text-muted">{t("social.result.empty")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="whitespace-pre-wrap rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4 text-sm leading-relaxed text-content">
              {draft.caption}
            </p>
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                {t("social.result.hashtags")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {draft.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-xs text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
