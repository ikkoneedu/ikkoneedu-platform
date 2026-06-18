import { Apple, Play } from "lucide-react";

interface StoreButtonsProps {
  className?: string;
}

/**
 * App Store ve Google Play indirme butonları (mock).
 * Gerçek mağaza bağlantısı yoktur.
 */
export function StoreButtons({ className = "" }: StoreButtonsProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <button
        type="button"
        className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-left transition-colors hover:bg-white/[0.1]"
      >
        <Apple size={26} className="text-content" aria-hidden="true" />
        <span>
          <span className="block text-[10px] uppercase tracking-wide text-muted">
            İndir
          </span>
          <span className="block text-sm font-semibold text-content">App Store</span>
        </span>
      </button>

      <button
        type="button"
        className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-left transition-colors hover:bg-white/[0.1]"
      >
        <Play size={24} className="fill-content text-content" aria-hidden="true" />
        <span>
          <span className="block text-[10px] uppercase tracking-wide text-muted">
            İndir
          </span>
          <span className="block text-sm font-semibold text-content">Google Play</span>
        </span>
      </button>
    </div>
  );
}
