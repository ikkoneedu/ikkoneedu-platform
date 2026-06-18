import type { Metadata } from "next";
import {
  CalendarCheck,
  CreditCard,
  Bell,
  GraduationCap,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Veli Portalı — ${productName}`,
  description: "Çocuğunuzun gelişimini ve okul iletişimini tek yerden takip edin.",
};

const announcements = [
  { id: "1", title: "Dönem sonu veli toplantısı", time: "2 gün önce" },
  { id: "2", title: "Bahar şenliği duyurusu", time: "4 gün önce" },
  { id: "3", title: "Servis güzergâhı güncellemesi", time: "1 hafta önce" },
];

export default function ParentPage() {
  return (
    <PageShell title="Veli Portalı">
      <div className="flex flex-col gap-10">
        <SectionHeader
          eyebrow="Veli"
          title="Hoş geldiniz, Yılmaz Ailesi"
          description="Elif'in gelişimini, duyuruları ve ödemeleri buradan takip edin."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Devam Oranı" value="%98" delta="+%1" trend="up" icon={CalendarCheck} />
          <StatCard label="Genel Ortalama" value="87" delta="+2" trend="up" icon={GraduationCap} />
          <StatCard label="Okunmamış Duyuru" value="4" icon={Bell} />
          <StatCard label="Ödeme Durumu" value="Güncel" icon={CreditCard} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassCard tone="navy" className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-content">
              Son Duyurular
            </h2>
            <ul className="space-y-3">
              {announcements.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy/40 text-accent">
                    <Bell size={16} aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-content">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted">{item.time}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard tone="navy" className="flex flex-col">
            <div className="flex items-center gap-2 text-accent">
              <MessageSquare size={18} aria-hidden="true" />
              <span className="text-sm font-semibold">Okul İletişimi</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Öğretmenlere ve rehberlik servisine doğrudan mesaj gönderin.
            </p>
            <PrimaryButton size="sm" className="mt-auto w-full">
              Mesaj Gönder
              <ArrowRight size={16} aria-hidden="true" />
            </PrimaryButton>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
