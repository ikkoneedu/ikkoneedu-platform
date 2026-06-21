"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

/**
 * Şablon metnini panoya kopyalayan küçük istemci düğmesi.
 * (MessageTemplates sunucu bileşeni kalsın diye ayrıldı — icon prop'u sunucuda.)
 */
export function CopyTemplateButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <PrimaryButton variant="secondary" size="sm" className="mt-4 w-full" onClick={copy}>
      {copied ? (
        <>
          <CheckCircle2 size={14} aria-hidden="true" /> Kopyalandı
        </>
      ) : (
        <>
          <Copy size={14} aria-hidden="true" /> Kullan
        </>
      )}
    </PrimaryButton>
  );
}
