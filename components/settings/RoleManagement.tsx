import { ShieldCheck, Users } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SettingsRole } from "@/lib/settings-mock-data";

interface RoleManagementProps {
  roles: SettingsRole[];
}

const LEVEL_STYLES: Record<string, string> = {
  "Tam Yetki": "border-brand/20 bg-brand/10 text-brand",
  Yüksek: "border-accent/20 bg-accent/10 text-accent",
  Orta: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Sınırlı: "border-white/10 bg-white/5 text-muted",
};

/**
 * Kullanıcı ve Rol Yönetimi — Yetki Rolleri.
 * Her rol için açıklama, yetki seviyesi ve kullanıcı sayısı.
 */
export function RoleManagement({ roles }: RoleManagementProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Yetki Rolleri</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex flex-col rounded-xl border border-white/5 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-content">{role.name}</h3>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  LEVEL_STYLES[role.level] ?? LEVEL_STYLES["Sınırlı"]
                }`}
              >
                {role.level}
              </span>
            </div>
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">
              {role.description}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              <Users size={13} aria-hidden="true" />
              {role.users.toLocaleString("tr-TR")} kullanıcı
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
