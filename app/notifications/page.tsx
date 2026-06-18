import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { NotificationMetrics } from "@/components/notifications/NotificationMetrics";
import { NotificationComposer } from "@/components/notifications/NotificationComposer";
import { NotificationPreview } from "@/components/notifications/NotificationPreview";
import { NotificationList } from "@/components/notifications/NotificationList";
import { UserPreferences } from "@/components/notifications/UserPreferences";
import { FcmReadiness } from "@/components/notifications/FcmReadiness";
import { NotificationAnalytics } from "@/components/notifications/NotificationAnalytics";
import { EmergencyNotification } from "@/components/notifications/EmergencyNotification";
import { productName } from "@/lib/constants";
import {
  notificationMetrics,
  composerOptions,
  notificationList,
  userPreferences,
  fcmCollections,
  fcmFlow,
  notificationAnalytics,
} from "@/lib/notifications-mock-data";

export const metadata: Metadata = {
  title: `Bildirim Merkezi — ${productName}`,
  description:
    "Push bildirimleri, sistem içi uyarıları ve kullanıcı etkileşimlerini tek merkezden yönetin.",
};

export default function NotificationsPage() {
  return (
    <PageShell title="Bildirim Merkezi">
      <div className="flex flex-col gap-10">
        {/* 1. Başlık */}
        <SectionHeader
          eyebrow="Bildirimler"
          title="Bildirim Merkezi"
          description="Push bildirimleri, sistem içi uyarıları ve kullanıcı etkileşimlerini tek merkezden yönetin."
        />

        {/* 2. Metrikler */}
        <NotificationMetrics metrics={notificationMetrics} />

        {/* 3 + 4. Oluşturucu ve önizleme */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <NotificationComposer options={composerOptions} />
          <NotificationPreview />
        </div>

        {/* 5. Bildirim listesi */}
        <NotificationList notifications={notificationList} />

        {/* 6. Kullanıcı tercihleri */}
        <UserPreferences preferences={userPreferences} />

        {/* 7. FCM hazırlığı */}
        <FcmReadiness collections={fcmCollections} flow={fcmFlow} />

        {/* 8. Analitik */}
        <NotificationAnalytics data={notificationAnalytics} />

        {/* 9. Acil bildirim modu */}
        <EmergencyNotification recipientGroups={composerOptions.recipientGroups} />
      </div>
    </PageShell>
  );
}
