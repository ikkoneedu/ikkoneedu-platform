import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { MessageCenter } from "@/components/messages/MessageCenter";
import { MessageMetrics } from "@/components/messages/MessageMetrics";
import { ChannelSelector } from "@/components/messages/ChannelSelector";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { AiMessageAssistant } from "@/components/messages/AiMessageAssistant";
import { InboxList } from "@/components/messages/InboxList";
import { SentHistory } from "@/components/messages/SentHistory";
import { NotificationReadiness } from "@/components/messages/NotificationReadiness";
import { MessageTemplates } from "@/components/messages/MessageTemplates";
import { CommunicationAnalytics } from "@/components/messages/CommunicationAnalytics";
import { productName } from "@/lib/constants";
import {
  communicationMetrics,
  composerOptions,
  aiPromptSuggestions,
  inboxMessages,
  sentMessages,
  notificationReadiness,
  messageTemplates,
  communicationAnalytics,
} from "@/lib/messages-mock-data";

export const metadata: Metadata = {
  title: `Message Center — ${productName}`,
  description:
    "Duyuru, mesaj, SMS, e-posta ve push bildirimlerinizi tek merkezden yönetin.",
};

export default function MessagesPage() {
  return (
    <PageShell title="Message Center">
      <div className="flex flex-col gap-10">
        {/* 1. Başlık */}
        <SectionHeader
          eyebrow="İletişim"
          title="Message Center"
          description="Duyuru, mesaj, SMS, e-posta ve push bildirimlerinizi tek merkezden yönetin."
        />

        {/* Gerçek uygulama içi mesajlaşma (canlı Firestore — FCM yok) */}
        <MessageCenter />

        {/* 2. Metrikler */}
        <MessageMetrics metrics={communicationMetrics} />

        {/* 3. Kanal seçimi */}
        <ChannelSelector />

        {/* 4 + 5. Mesaj oluşturucu ve AI asistanı */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MessageComposer options={composerOptions} />
          <AiMessageAssistant suggestions={aiPromptSuggestions} />
        </div>

        {/* 6 + 8. Gelen kutusu ve bildirim hazırlığı */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InboxList messages={inboxMessages} />
          <NotificationReadiness items={notificationReadiness} />
        </div>

        {/* 7. Gönderim geçmişi */}
        <SentHistory messages={sentMessages} />

        {/* 9. Mesaj şablonları */}
        <MessageTemplates templates={messageTemplates} />

        {/* 10. İletişim analitiği */}
        <CommunicationAnalytics data={communicationAnalytics} />
      </div>
    </PageShell>
  );
}
