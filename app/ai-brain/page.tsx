import type { Metadata } from "next";
import { AiComingSoonNotice } from "@/components/ai/AiComingSoonNotice";
import { Bot, Sparkles, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { AiModeCard } from "@/components/ai/AiModeCard";
import { QuickPromptGrid } from "@/components/ai/QuickPromptGrid";
import { AiUsageMetrics } from "@/components/ai/AiUsageMetrics";
import { KnowledgeBaseCard } from "@/components/ai/KnowledgeBaseCard";
import { SecurityNotice } from "@/components/ai/SecurityNotice";
import { productName } from "@/lib/constants";
import {
  aiInitialMessages,
  aiModes,
  aiQuickPrompts,
  aiUsageMetrics,
  aiKnowledgeBaseItems,
  aiSecurityFeatures,
} from "@/lib/ai-mock-data";

export const metadata: Metadata = {
  title: `AI Brain — ${productName}`,
  description:
    "Okulun kurumsal hafızasını, akademik süreçlerini ve günlük operasyonlarını tek yapay zeka merkezinden yönetin.",
};

export default function AiBrainPage() {
  return (
    <PageShell title="AI Brain">
      <div className="flex flex-col gap-10">
        <AiComingSoonNotice />

        <SectionHeader
          eyebrow="AI Brain"
          title="AI Brain"
          description="Okulun kurumsal hafızasını, akademik süreçlerini ve günlük operasyonlarını tek yapay zeka merkezinden yönetin."
        />

        {/* 1. Karşılama */}
        <GlassCard className="ai-gradient flex items-start gap-4 border-accent/20">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15 text-accent">
            <Bot size={26} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-content">
              Merhaba, ben ikkoneedu AI Brain.
            </h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
              Okulunuzun duyuruları, belgeleri, ders programları, öğrenci
              süreçleri ve yönetim verileri hakkında akıllı destek sağlarım.
            </p>
          </div>
        </GlassCard>

        {/* 2 + 3. Chat paneli ve rol bazlı modlar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AiChatPanel initialMessages={aiInitialMessages} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-content">
              <Sparkles size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Rol Bazlı AI Modları</h2>
            </div>
            {aiModes.map((mode) => (
              <AiModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </div>

        {/* 4 + 7. Kurumsal hafıza ve güvenlik */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <KnowledgeBaseCard items={aiKnowledgeBaseItems} />
          <SecurityNotice features={aiSecurityFeatures} />
        </div>

        {/* 5. Hızlı komutlar */}
        <section>
          <div className="mb-4 flex items-center gap-2 text-content">
            <Zap size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Hızlı Komutlar</h2>
          </div>
          <QuickPromptGrid prompts={aiQuickPrompts} />
        </section>

        {/* 6. Kullanım metrikleri */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-content">
            AI Kullanım Metrikleri
          </h2>
          <AiUsageMetrics metrics={aiUsageMetrics} />
        </section>
      </div>
    </PageShell>
  );
}
