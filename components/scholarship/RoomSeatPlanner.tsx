import { DoorOpen, QrCode } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { rooms } from "@/lib/scholarship-exam-mock-data";

/**
 * Salon / Sıra Yerleşimi.
 * Her salon için doluluk çubuğu ve örnek sıra ızgarası.
 */
export function RoomSeatPlanner() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <DoorOpen size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Salon / Sıra Yerleşimi</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const ratio = Math.round((room.occupancy / room.capacity) * 100);
          return (
            <div
              key={room.id}
              className="rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-content">{room.name}</span>
                <span className="text-xs text-muted">
                  {room.occupancy}/{room.capacity}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-overlay/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/40 to-accent"
                  style={{ width: `${ratio}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs font-medium text-accent">%{ratio} dolu</p>

              <div className="mt-4 grid grid-cols-6 gap-1.5">
                {Array.from({ length: room.capacity }).map((_, i) => (
                  <span
                    key={i}
                    className={[
                      "aspect-square rounded-[4px]",
                      i < room.occupancy ? "bg-accent/60" : "bg-overlay/[0.06]",
                    ].join(" ")}
                  />
                ))}
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                <QrCode size={13} className="text-accent" aria-hidden="true" />
                QR giriş kodu hazırlığı yapıldı
              </p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
