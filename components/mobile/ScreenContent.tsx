import { LogoMark } from "@/components/shared/LogoMark";

interface ScreenContentProps {
  title: string;
  rows: string[];
}

/**
 * Telefon mockup'ı içinde gösterilen örnek uygulama ekranı.
 * Üst başlık ve liste satırlarıyla sade, premium bir mobil arayüz taklit eder.
 */
export function ScreenContent({ title, rows }: ScreenContentProps) {
  return (
    <div className="flex h-full flex-col px-3 pb-3">
      {/* Üst başlık */}
      <div className="flex items-center gap-2 border-b border-overlay/10 pb-3">
        <LogoMark size={20} />
        <span className="text-xs font-semibold text-content">{title}</span>
      </div>

      {/* Satırlar */}
      <div className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <div
            key={row}
            className={[
              "rounded-xl border px-3 py-2.5 text-[11px] leading-tight",
              index === 0
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-overlay/10 bg-overlay/[0.04] text-muted",
            ].join(" ")}
          >
            {row}
          </div>
        ))}
      </div>

      {/* Alt navigasyon taklidi */}
      <div className="mt-auto flex items-center justify-around border-t border-overlay/10 pt-3">
        {[0, 1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={[
              "h-1.5 w-1.5 rounded-full",
              dot === 0 ? "bg-accent" : "bg-overlay/20",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
