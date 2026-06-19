import { LogoMark } from "@/components/shared/LogoMark";

/**
 * Kök yükleme durumu — route geçişlerinde gösterilen minimal premium ekran.
 */
export default function Loading() {
  return (
    <div className="mesh-bg flex min-h-screen w-full flex-col items-center justify-center gap-4">
      <div className="animate-pulse">
        <LogoMark size={44} />
      </div>
      <span className="h-1.5 w-24 animate-pulse rounded-full bg-accent/60" />
      <span className="sr-only">Yükleniyor…</span>
    </div>
  );
}
