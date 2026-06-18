import { Contact, Phone, Mail, GraduationCap, Radio, History, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { LeadDetail } from "@/lib/crm-mock-data";

interface LeadDetailsProps {
  lead: LeadDetail;
}

/**
 * Lead Detay Ekranı.
 */
export function LeadDetails({ lead }: LeadDetailsProps) {
  const rows = [
    { id: "phone", label: "Telefon", value: lead.phone, icon: Phone },
    { id: "email", label: "E-posta", value: lead.email, icon: Mail },
    { id: "student", label: "Öğrenci Bilgileri", value: lead.studentInfo, icon: GraduationCap },
    { id: "level", label: "İlgilendiği Kademe", value: lead.level, icon: GraduationCap },
    { id: "source", label: "Lead Kaynağı", value: lead.source, icon: Radio },
    { id: "last", label: "Son Görüşme", value: lead.lastContact, icon: History },
  ];

  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <Contact size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Lead Detayı</h2>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy/40 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
          {lead.parentName.split(" ").map((n) => n[0]).join("")}
        </span>
        <div>
          <p className="text-sm font-semibold text-content">{lead.parentName}</p>
          <p className="text-xs text-muted">{lead.level}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.id} className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted">
                <Icon size={14} aria-hidden="true" />
                {row.label}
              </dt>
              <dd className="text-right text-content">{row.value}</dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 p-3 text-sm text-accent">
        <ArrowRight size={15} aria-hidden="true" />
        <span className="font-medium">Sonraki Aksiyon: {lead.nextAction}</span>
      </div>
    </GlassCard>
  );
}
