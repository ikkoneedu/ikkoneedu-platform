import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";
import { AnnouncementBoard } from "@/components/announcements/AnnouncementBoard";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Bildirim Merkezi — ${productName}`,
  description:
    "Kişisel bildirimleriniz, okul duyuruları ve sistem uyarıları tek merkezde.",
};

export default function NotificationsPage() {
  return (
    <PageShell title="Bildirim Merkezi">
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Bildirimler"
          title="Bildirim Merkezi"
          description="Kişisel bildirimlerinizi ve okul duyurularını tek merkezden takip edin. (Push/FCM entegrasyonu sonraki fazda.)"
        />

        {/* Kişisel bildirimler (canlı — userId == uid) */}
        <NotificationCenter />

        {/* Duyuru oluştur + liste (canlı; personel yayınlar, herkes görür).
            Yeni duyuru otomatik bildirim akışına düşer. */}
        <AnnouncementBoard />

        {/* Tenant bildirim akışı (canlı Firestore) */}
        <NotificationFeed />
      </div>
    </PageShell>
  );
}
