/**
 * USB QR okuyucu (Keyboard Wedge / HID) klavye arabelleği — SAF, framework'ten
 * bağımsız mantık. `ScannerKeyboardInput` bileşeni bunu React `onKeyDown` ile
 * sarar; burada DOM'a bağımlılık yoktur ki düz Node ile test edilebilsin
 * (bkz. `scripts/test-scanner-buffer.ts`).
 *
 * Fiziksel okuyucular klavyeden yazılmış gibi çok hızlı (~<40ms/karakter)
 * karakter basar ve genelde sonunda Enter (bazen Tab/CRLF) gönderir. Bu modül
 * yalnızca UX/ipucu amaçlı "muhtemelen okuyucu mu" tahmini yapar — GERÇEK
 * güvenlik her zaman backend'de QR imza doğrulamasındadır, bu arabellek
 * yalnızca "ne zaman tamamlandı" sinyalini üretir.
 */

export interface ScanBufferOptions {
  /** Karakterler arası bu süreden (ms) uzun boşluk → arabellek sıfırlanır. */
  staleAfterMs?: number;
}

export interface ScanCompletion {
  /** Enter/Tab'a kadar biriken metin. */
  value: string;
  /** Karakterler arası ortalama süre (ms). */
  avgIntervalMs: number;
  /** Ortalama aralık eşiğin altındaysa muhtemelen fiziksel okuyucudur (ipucu). */
  likelyScanner: boolean;
}

const DEFAULT_STALE_MS = 2000;
/** Fiziksel okuyucular genelde karakter başına ~1-20ms yazar; elle yazımda bu çok daha yüksektir. */
const SCANNER_AVG_INTERVAL_THRESHOLD_MS = 40;

function averageInterval(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < timestamps.length; i += 1) sum += timestamps[i] - timestamps[i - 1];
  return sum / (timestamps.length - 1);
}

/** Klavye-wedge arabelleği: karakterleri toplar, Enter/Tab/CR/LF'de tamamlar. */
export class ScanKeyBuffer {
  private chars: string[] = [];
  private timestamps: number[] = [];
  private readonly staleAfter: number;

  constructor(opts: ScanBufferOptions = {}) {
    this.staleAfter = opts.staleAfterMs ?? DEFAULT_STALE_MS;
  }

  reset(): void {
    this.chars = [];
    this.timestamps = [];
  }

  get length(): number {
    return this.chars.length;
  }

  get currentValue(): string {
    return this.chars.join("");
  }

  /**
   * Bir tuş ekler (React `KeyboardEvent.key` değeri). Sonlandırıcı tuş
   * (Enter/Tab) veya CR/LF karakteri gelirse arabelleği tamamlayıp döner;
   * aksi halde `null` döner (birikime devam edilir).
   */
  push(key: string, atMs: number): ScanCompletion | null {
    if (this.timestamps.length > 0) {
      const lastAt = this.timestamps[this.timestamps.length - 1];
      if (atMs - lastAt > this.staleAfter) this.reset();
    }

    if (key === "Enter" || key === "Tab" || key === "\n" || key === "\r") {
      return this.finish();
    }
    // Shift/Control/Alt/ArrowLeft gibi kontrol tuşları (length > 1) yok sayılır.
    if (key.length !== 1) return null;
    this.chars.push(key);
    this.timestamps.push(atMs);
    return null;
  }

  /** Arabellek uzun süredir güncellenmediyse (yarım kalmış tarama) sıfırlar. */
  clearIfStale(nowMs: number): boolean {
    if (this.timestamps.length === 0) return false;
    const lastAt = this.timestamps[this.timestamps.length - 1];
    if (nowMs - lastAt > this.staleAfter) {
      this.reset();
      return true;
    }
    return false;
  }

  private finish(): ScanCompletion | null {
    if (this.chars.length === 0) return null;
    const value = this.chars.join("");
    const avgIntervalMs = averageInterval(this.timestamps);
    const likelyScanner = avgIntervalMs > 0 && avgIntervalMs < SCANNER_AVG_INTERVAL_THRESHOLD_MS;
    this.reset();
    return { value, avgIntervalMs, likelyScanner };
  }
}

/**
 * Aynı QR değeri kısa sürede iki kez tamamlanırsa (ör. okuyucu titremesi,
 * kullanıcı ikinci kez okuttu) frontend'de tekrar isteği engellemek için.
 * GERÇEK tekrar/replay koruması backend'dedir; bu yalnızca UX/ağ trafiği içindir.
 */
export function isDuplicateScan(
  lastValue: string | null,
  lastAtMs: number | null,
  value: string,
  nowMs: number,
  windowMs = 4000,
): boolean {
  if (!lastValue || lastAtMs === null) return false;
  return lastValue === value && nowMs - lastAtMs < windowMs;
}
