"use client";

import { useState } from "react";
import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

/**
 * Randevuyu onaylar — yerel kayıt + onay durumu.
 * (AppointmentAssistant sunucu bileşeni kalsın diye ayrıldı; gerçek takvim
 * entegrasyonu için backend gerekir.)
 */
export function ConfirmAppointmentButton() {
  const [done, setDone] = useState(false);

  const confirm = () => {
    try {
      const list = JSON.parse(localStorage.getItem("ikkoneedu:appointments") || "[]");
      list.unshift({ confirmedAt: new Date().toISOString() });
      localStorage.setItem("ikkoneedu:appointments", JSON.stringify(list.slice(0, 50)));
    } catch {
      /* yoksay */
    }
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <PrimaryButton size="md" className="mt-5 w-full" onClick={confirm}>
      {done ? (
        <>
          <CheckCircle2 size={16} aria-hidden="true" /> Randevu Onaylandı
        </>
      ) : (
        <>
          <CalendarPlus size={16} aria-hidden="true" /> Randevuyu Onayla
        </>
      )}
    </PrimaryButton>
  );
}
