import { CalendarClock } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { CrmAppointment, AppointmentStatus } from "@/lib/crm-mock-data";

interface AppointmentsProps {
  appointments: CrmAppointment[];
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  Bekliyor: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Onaylandı: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Gerçekleşti: "border-accent/20 bg-accent/10 text-accent",
  İptal: "border-brand/20 bg-brand/10 text-brand",
};

/**
 * Randevu Yönetimi listesi.
 * Masaüstünde tablo, mobilde kart düzeni.
 */
export function Appointments({ appointments }: AppointmentsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <CalendarClock size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Randevu Yönetimi</h2>
      </div>

      <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 border-b border-white/10 px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
        <span>Veli</span>
        <span>Tarih / Saat</span>
        <span>Kampüs</span>
        <span>Danışman</span>
        <span>Durum</span>
      </div>

      <ul className="divide-y divide-white/5">
        {appointments.map((appt) => (
          <li
            key={appt.id}
            className="flex flex-col gap-2 px-2 py-3 lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold text-content">{appt.parent}</span>
            <span className="text-sm text-muted">{appt.date} · {appt.time}</span>
            <span className="text-sm text-muted">{appt.campus}</span>
            <span className="text-sm text-muted">{appt.advisor}</span>
            <span>
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[appt.status]}`}>
                {appt.status}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
