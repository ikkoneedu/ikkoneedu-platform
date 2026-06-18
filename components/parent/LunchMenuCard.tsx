import { UtensilsCrossed, AlertTriangle, Dot } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { LunchMenu } from "@/lib/mock-data";

interface LunchMenuCardProps {
  menu: LunchMenu;
}

/**
 * Yemek listesi kartı.
 * Bugünün menüsünü ve alerjen uyarısını gösterir.
 */
export function LunchMenuCard({ menu }: LunchMenuCardProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <UtensilsCrossed size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bugünün Menüsü</h2>
      </div>

      <ul className="space-y-2">
        {menu.items.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-sm text-content">
            <Dot size={20} className="text-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 pt-3">
        <AlertTriangle
          size={16}
          className="mt-0.5 shrink-0 text-amber-400"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-muted">{menu.allergens}</p>
      </div>
    </GlassCard>
  );
}
