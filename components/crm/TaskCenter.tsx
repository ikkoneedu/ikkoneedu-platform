import { ListChecks } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { TaskGroup } from "@/lib/crm-mock-data";

interface TaskCenterProps {
  groups: TaskGroup[];
}

/**
 * Görev Merkezi.
 * Aranacak, teklif bekleyen, hatırlatma ve geri dönüş görev grupları.
 */
export function TaskCenter({ groups }: TaskCenterProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2 text-content">
        <ListChecks size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Görev Merkezi</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <GlassCard key={group.id} tone="navy" interactive className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-content">{group.title}</h3>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent/15 px-2 text-xs font-bold text-accent">
                {group.count}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
