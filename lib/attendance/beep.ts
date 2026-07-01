"use client";

/**
 * Basit tarayıcı beep sesi (Web Audio API) — ek ses dosyası GEREKMEZ.
 * Başarı/hata için kısa, farklı frekanslı bir ton çalar. Autoplay
 * kısıtlamaları nedeniyle sessizce başarısız olabilir (best-effort).
 */
let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  return sharedContext;
}

function beep(frequency: number, durationMs: number, volume = 0.15): void {
  try {
    const ctx = getContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    /* best-effort — sessizce yok say */
  }
}

/** Başarılı taramada kısa, olumlu (yüksek perde) bip. */
export function playSuccessBeep(): void {
  beep(880, 140);
}

/** Hatalı taramada kısa, uyarı (alçak perde, çift) bip. */
export function playErrorBeep(): void {
  beep(220, 160);
  setTimeout(() => beep(180, 180), 180);
}
