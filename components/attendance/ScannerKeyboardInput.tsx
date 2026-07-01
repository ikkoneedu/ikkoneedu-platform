"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ScanKeyBuffer, type ScanCompletion } from "@/lib/attendance/scanner-buffer";

interface ScannerKeyboardInputProps {
  /** Bir tarama (Enter/Tab ile) tamamlanınca çağrılır. */
  onScan: (completion: ScanCompletion) => void;
  /** true iken yeni tuş girdisi yok sayılır (ör. önceki tarama işleniyor). */
  disabled?: boolean;
  /** Geliştirmede arabellek içeriğini görünür yapar (production'da kapalı tutulmalı). */
  debug?: boolean;
  className?: string;
}

/**
 * USB QR okuyucu (Keyboard Wedge / HID) klavye yakalayıcı.
 *
 * KAMERA KULLANMAZ. Fiziksel okuyucu, QR içeriğini klavyeden yazılmış gibi
 * çok hızlı basar ve genelde Enter (bazen Tab) ile bitirir. Bu bileşen:
 *  - Görünmez bir input'u SÜREKLİ focus'ta tutar (kullanıcı başka yere
 *    tıklasa bile periyodik olarak odağı geri alır).
 *  - Karakterleri `ScanKeyBuffer`e besler (saf mantık, bkz.
 *    `lib/attendance/scanner-buffer.ts`); Enter/Tab gelince tamamlanmış
 *    taramayı `onScan` ile üst bileşene bildirir.
 *  - Manuel klavye girişini "muhtemelen okuyucu mu" ipucuyla ayırt etmeye
 *    çalışır (`completion.likelyScanner`) ama GERÇEK güvenlik backend'deki
 *    QR imza doğrulamasındadır — bu yalnızca UX ipucudur.
 */
export function ScannerKeyboardInput({
  onScan,
  disabled = false,
  debug = false,
  className = "",
}: ScannerKeyboardInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bufferRef = useRef(new ScanKeyBuffer());
  const [debugValue, setDebugValue] = useState("");

  const refocus = useCallback(() => {
    if (disabled) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [disabled]);

  // İlk yüklemede + periyodik olarak odağı garanti et (yanlışlıkla tıklama korunağı).
  useEffect(() => {
    refocus();
    const interval = setInterval(refocus, 800);
    return () => clearInterval(interval);
  }, [refocus]);

  // Arabellekte yarım kalmış (eski) veri varsa periyodik temizle.
  useEffect(() => {
    const interval = setInterval(() => {
      if (bufferRef.current.clearIfStale(performance.now()) && debug) {
        setDebugValue("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [debug]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const completion = bufferRef.current.push(event.key, event.timeStamp);
    if (debug) setDebugValue(bufferRef.current.currentValue);
    if (completion) {
      event.preventDefault();
      setDebugValue("");
      if (inputRef.current) inputRef.current.value = "";
      onScan(completion);
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        inputMode="none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-hidden="true"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onBlur={refocus}
        disabled={disabled}
        className={
          debug
            ? "w-full rounded-lg border border-accent/30 bg-overlay/[0.04] px-3 py-2 font-mono text-xs text-accent outline-none"
            : "pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        }
      />
      {debug && (
        <p className="mt-1 font-mono text-[11px] text-muted">
          buffer: {debugValue || "(boş)"} · {bufferRef.current.length} karakter
        </p>
      )}
    </div>
  );
}
