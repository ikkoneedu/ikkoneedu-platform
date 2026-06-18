import { Users, MapPin, Wallet, CalendarCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { CandidateParent, LeadPriority } from "@/lib/admissions-ai-mock-data";

interface CandidateProfilesProps {
  candidates: CandidateParent[];
}

const PRIORITY_STYLES: Record<LeadPriority, string> = {
  "Sıcak Lead": "border-brand/20 bg-brand/10 text-brand",
  "Randevu Bekliyor": "border-amber-400/20 bg-amber-400/10 text-amber-400",
  "Bilgi Talebi": "border-accent/20 bg-accent/10 text-accent",
};

/**
 * Aday Veli Profili kartları.
 */
export function CandidateProfiles({ candidates }: CandidateProfilesProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2 text-content">
        <Users size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Aday Veli Profili</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <GlassCard key={candidate.id} tone="navy" interactive className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-content">{candidate.name}</h3>
              <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[candidate.priority]}`}>
                {candidate.priority}
              </span>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Çocuğun Yaşı</dt>
                <dd className="text-content">{candidate.childAge}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">İlgilendiği Kademe</dt>
                <dd className="text-content">{candidate.level}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted">
                  <MapPin size={13} aria-hidden="true" /> Lokasyon
                </dt>
                <dd className="text-content">{candidate.location}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Wallet size={13} aria-hidden="true" /> Bütçe
                </dt>
                <dd className="text-content">{candidate.budget}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted">
                  <CalendarCheck size={13} aria-hidden="true" /> Randevu
                </dt>
                <dd className="text-content">{candidate.appointment}</dd>
              </div>
            </dl>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
