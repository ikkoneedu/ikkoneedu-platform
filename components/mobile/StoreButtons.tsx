import { Apple, Play } from "lucide-react";

interface StoreButtonsProps {
  className?: string;
}

/**
 * App Store ve Google Play indirme butonları.
 * Mağaza bağlantıları henüz yayında olmadığından butonlar devre dışıdır ve
 * "Yakında" etiketi gösterir (dead button bırakılmaz).
 */
export function StoreButtons({ className = "" }: StoreButtonsProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <button
        type="button"
        disabled
        aria-label="App Store — yakında"
        title="Yakında App Store'da"
        className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-overlay/15 bg-overlay/[0.06] px-5 py-2.5 text-left opacity-60"
      >
        <Apple size={26} className="text-content" aria-hidden="true" />
        <span>
          <span className="block text-[10px] uppercase tracking-wide text-accent">
            Yakında
          </span>
          <span className="block text-sm font-semibold text-content">App Store</span>
        </span>
      </button>

      <button
        type="button"
        disabled
        aria-label="Google Play — yakında"
        title="Yakında Google Play'de"
        className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-overlay/15 bg-overlay/[0.06] px-5 py-2.5 text-left opacity-60"
      >
        <Play size={24} className="fill-content text-content" aria-hidden="true" />
        <span>
          <span className="block text-[10px] uppercase tracking-wide text-accent">
            Yakında
          </span>
          <span className="block text-sm font-semibold text-content">Google Play</span>
        </span>
      </button>
    </div>
  );
}
