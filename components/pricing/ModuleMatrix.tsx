import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { getServerT } from "@/lib/i18n/server";
import { PACKAGES } from "@/lib/packages";
import {
  MODULE_CATALOG,
  type ModuleCategory,
  type ModuleStatus,
} from "@/lib/modules/module-catalog";
import { isModuleIncludedInPackage } from "@/lib/modules/resolver";

const CATEGORY_ORDER: ModuleCategory[] = [
  "communication",
  "schoolLife",
  "growth",
  "academic",
  "operations",
  "ai",
];

const STATUS_BADGE: Partial<Record<ModuleStatus, string>> = {
  pilot: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  comingSoon: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  aiReady: "border-accent/30 bg-accent/10 text-accent",
};

/**
 * Modül Matrisi — KATALOG ODAKLI fiyatlandırma görünümü (salt okunur).
 *
 * Tek doğruluk kaynağından (MODULE_CATALOG + resolver) hangi modülün hangi
 * pakette olduğunu üretir. Ödeme yok; her satır Demo/teklif CTA'sına götürür.
 * Yapay zekâ modülleri "AI Hazır/Yakında" rozetiyle işaretlenir.
 */
export async function ModuleMatrix() {
  const t = await getServerT();
  const categories = CATEGORY_ORDER.filter((c) =>
    MODULE_CATALOG.some((m) => m.category === c),
  );

  return (
    <GlassCard tone="navy">
      <div className="mb-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-content">
          {t("modules.matrix.title")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
          {t("modules.matrix.desc")}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-overlay/10">
              <th className="py-3 pr-4 text-xs font-medium uppercase tracking-wide text-muted">
                {t("modules.matrix.title")}
              </th>
              {PACKAGES.map((p) => (
                <th
                  key={p.id}
                  className="px-3 py-3 text-center text-sm font-semibold text-content"
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <CategoryGroup key={cat} category={cat} label={t(`modules.cat.${cat}`)} t={t} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <Link href="/demo">
          <PrimaryButton size="lg">{t("modules.matrix.cta")}</PrimaryButton>
        </Link>
      </div>
    </GlassCard>
  );
}

function CategoryGroup({
  category,
  label,
  t,
}: {
  category: ModuleCategory;
  label: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const mods = MODULE_CATALOG.filter((m) => m.category === category);
  return (
    <>
      <tr className="bg-overlay/[0.03]">
        <td
          colSpan={PACKAGES.length + 1}
          className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent"
        >
          {label}
        </td>
      </tr>
      {mods.map((m) => (
        <tr key={m.id} className="border-b border-overlay/[0.06]">
          <td className="py-2.5 pr-4">
            <span className="flex flex-wrap items-center gap-2 text-content">
              {t(m.nameKey)}
              {m.status !== "live" && STATUS_BADGE[m.status] && (
                <span
                  className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[m.status]}`}
                >
                  {t(`modules.status.${m.status}`)}
                </span>
              )}
            </span>
          </td>
          {PACKAGES.map((p) => {
            const included = isModuleIncludedInPackage(m.id, p.id);
            return (
              <td key={p.id} className="px-3 py-2.5 text-center">
                {included ? (
                  <Check
                    size={16}
                    className="mx-auto text-emerald-400"
                    aria-label={t("modules.matrix.included")}
                  />
                ) : (
                  <Minus
                    size={16}
                    className="mx-auto text-muted/50"
                    aria-label={t("modules.matrix.notIncluded")}
                  />
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
