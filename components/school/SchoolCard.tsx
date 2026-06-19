import Link from "next/link";
import { Users, Award } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { SchoolOption } from "@/lib/mock-data";

interface SchoolCardProps {
  option: SchoolOption;
  onSelect: (option: SchoolOption) => void;
}

/**
 * Okul/kampüs seçim kartı.
 * Logo alanı, okul adı, kurum tipi, kullanıcı sayısı ve eylem butonu içerir.
 * Hover'da yükselme ve aksan vurgusu uygulanır.
 */
export function SchoolCard({ option, onSelect }: SchoolCardProps) {
  const Icon = option.icon;

  return (
    <GlassCard
      tone="navy"
      interactive
      className={[
        "group flex h-full flex-col",
        option.isAddNew ? "border-dashed border-white/15" : "",
      ].join(" ")}
    >
      {/* Logo alanı */}
      <span
        className={[
          "flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors",
          option.isAddNew
            ? "border-white/15 bg-white/[0.03] text-muted group-hover:text-accent"
            : "border-accent/20 bg-navy/50 text-accent",
        ].join(" ")}
      >
        <Icon size={26} aria-hidden="true" />
      </span>

      <h3 className="mt-5 text-lg font-semibold tracking-tight text-content">
        {option.name}
      </h3>
      <p className="mt-1 text-sm text-accent">{option.type}</p>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted">
        <Users size={16} aria-hidden="true" />
        <span>Aktif kullanıcı: {option.activeUsers}</span>
      </div>

      <PrimaryButton
        type="button"
        variant={option.isAddNew ? "secondary" : "primary"}
        size="md"
        className="mt-6 w-full"
        onClick={() => onSelect(option)}
      >
        {option.actionLabel}
      </PrimaryButton>

      {!option.isAddNew && (
        <Link
          href="/scholarship-exam/apply"
          className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-content"
        >
          <Award size={13} aria-hidden="true" />
          Bursluluk Başvurusu
        </Link>
      )}
    </GlassCard>
  );
}
