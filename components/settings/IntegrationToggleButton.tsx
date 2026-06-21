"use client";

import { useEffect, useState } from "react";
import { Plug, Power } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

const KEY = "ikkoneedu:integrations";

function readOverride(id: string): boolean | null {
  try {
    const map = JSON.parse(localStorage.getItem(KEY) || "{}");
    return typeof map[id] === "boolean" ? map[id] : null;
  } catch {
    return null;
  }
}

function writeOverride(id: string, value: boolean) {
  try {
    const map = JSON.parse(localStorage.getItem(KEY) || "{}");
    map[id] = value;
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* yoksay */
  }
}

/**
 * Entegrasyon bağlantı durumunu (yerel) yönetir: bağla/kaldır + kalıcı kayıt.
 * Sunucu bileşeni içinde kullanılır (icon prop'u sunucuda kalır).
 * Not: gerçek OAuth/API bağlantısı için sağlayıcı anahtarı gerekir.
 */
export function IntegrationToggleButton({
  id,
  initialConnected,
}: {
  id: string;
  initialConnected: boolean;
}) {
  const [connected, setConnected] = useState(initialConnected);

  useEffect(() => {
    const o = readOverride(id);
    if (o !== null) setConnected(o);
  }, [id]);

  const toggle = () => {
    const next = !connected;
    setConnected(next);
    writeOverride(id, next);
  };

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <span className={`text-[11px] font-medium ${connected ? "text-emerald-400" : "text-muted"}`}>
        {connected ? "● Bağlı" : "○ Bağlı değil"}
      </span>
      <PrimaryButton
        variant={connected ? "secondary" : "primary"}
        size="sm"
        className="w-full"
        onClick={toggle}
      >
        {connected ? (
          <>
            <Power size={14} aria-hidden="true" /> Bağlantıyı Kaldır
          </>
        ) : (
          <>
            <Plug size={14} aria-hidden="true" /> Bağla
          </>
        )}
      </PrimaryButton>
    </div>
  );
}
