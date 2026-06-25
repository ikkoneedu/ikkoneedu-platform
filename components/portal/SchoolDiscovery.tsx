"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  MapPin,
  AlertCircle,
  MessageSquarePlus,
  Search,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { listSchools, type SchoolRecord } from "@/lib/services/schools";
import { SchoolInquiryForm } from "@/components/portal/SchoolInquiryForm";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/**
 * Aday/misafir okul keşfi.
 * Giriş yapmış PUBLIC kullanıcı, süper adminin oluşturduğu GERÇEK okulları
 * görür, arar ve seçtiği okula bilgi/iletişim talebi gönderir (okulun CRM
 * gelen kutusuna düşer). Firebase yoksa veya okul yoksa bilgilendirme gösterir.
 */
export function SchoolDiscovery() {
  const [schools, setSchools] = useState<SchoolRecord[] | null>(null);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await listSchools();
      // Yalnızca aktif okullar adaylara gösterilir.
      setSchools(all.filter((s) => s.status !== "SUSPENDED"));
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSchools([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const q = search.trim().toLowerCase();
  const filtered = (schools ?? []).filter(
    (s) =>
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q),
  );

  if (schools === null) {
    return (
      <GlassCard tone="navy" className="text-sm text-muted">Okullar yükleniyor…</GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      {schools.length > 0 && (
        <div className="relative max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Okul veya şehir ara…"
            className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] py-2.5 pl-10 pr-4 text-sm text-content placeholder:text-muted/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      )}

      {schools.length === 0 ? (
        <GlassCard tone="navy" className="flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
          <div className="text-sm text-muted">
            <p className="font-semibold text-content">Henüz okul yayımlanmadı</p>
            <p className="mt-1">
              Platforma kayıtlı okullar burada listelenecek. Kısa süre sonra tekrar
              kontrol edin.
            </p>
          </div>
        </GlassCard>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">“{search}” için okul bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((school) => (
            <GlassCard key={school.id} tone="navy" className="flex flex-col">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-overlay/10 bg-navy/40 text-accent">
                <GraduationCap size={24} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-content">
                {school.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={14} aria-hidden="true" />
                {school.city || "Konum belirtilmedi"}
              </p>

              <div className="mt-5 flex-1">
                {openId === school.id ? (
                  <SchoolInquiryForm
                    schoolName={school.name}
                    tenantId={school.id}
                    onClose={() => setOpenId(null)}
                  />
                ) : null}
              </div>

              {openId !== school.id && (
                <PrimaryButton
                  size="sm"
                  className="mt-5 w-full"
                  onClick={() => {
                    setOpenId(school.id);
                    setError(null);
                  }}
                >
                  <MessageSquarePlus size={16} aria-hidden="true" />
                  Bilgi İste
                </PrimaryButton>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
