import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { MessageCenter } from "@/components/messages/MessageCenter";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Mesaj Merkezi — ${productName}`,
  description:
    "Uygulama içi mesajlaşma: gelen kutusu, gönderim ve kişiler tek merkezde.",
};

export default function MessagesPage() {
  return (
    <PageShell title="Mesaj Merkezi">
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="İletişim"
          title="Mesaj Merkezi"
          description="Uygulama içi mesajlaşmanızı tek merkezden yönetin. (SMS/e-posta/push entegrasyonları sonraki fazda.)"
        />

        {/* Gerçek uygulama içi mesajlaşma (canlı Firestore — FCM yok).
            Mock metrik/kanal/şablon/analitik bölümleri kaldırıldı; SMS/e-posta/
            push gerçek entegrasyon gerektirdiğinden ayrı fazda eklenecek. */}
        <MessageCenter />
      </div>
    </PageShell>
  );
}
