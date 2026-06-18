import { Eye } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { LogoMark } from "@/components/shared/LogoMark";
import { PhoneMockup } from "@/components/mobile/PhoneMockup";

/**
 * Bildirim Önizleme — telefon mockup'ı içinde push notification.
 */
export function NotificationPreview() {
  return (
    <GlassCard tone="navy" className="flex flex-col items-center">
      <div className="mb-5 flex w-full items-center gap-2">
        <Eye size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bildirim Önizleme</h2>
      </div>

      <PhoneMockup>
        <div className="flex h-full flex-col px-3 pt-2">
          {/* Saat / kilit ekranı üst kısmı */}
          <div className="py-4 text-center">
            <p className="text-3xl font-bold text-content">14:00</p>
            <p className="text-[11px] text-muted">Pazartesi, 22 Haziran</p>
          </div>

          {/* Push bildirim kartı */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-3 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <LogoMark size={18} />
              <span className="text-xs font-semibold text-content">İngiliz Kültür Kolejleri</span>
              <span className="ml-auto text-[10px] text-muted">şimdi</span>
            </div>
            <p className="mt-2 text-[12px] font-semibold leading-snug text-content">
              Yarın veli toplantısı bulunmaktadır.
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">
              Saat 14.00 - Konferans Salonu
            </p>
          </div>
        </div>
      </PhoneMockup>
    </GlassCard>
  );
}
