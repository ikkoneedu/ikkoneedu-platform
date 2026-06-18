import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { LogoMark } from "@/components/shared/LogoMark";
import type { NotificationItem } from "@/lib/mobile-mock-data";

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

/**
 * Bildirim Merkezi.
 * iOS tarzı push bildirim mockup'larıyla bildirim kategorilerini gösterir (mock).
 */
export function NotificationCenter({ notifications }: NotificationCenterProps) {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow="Bildirimler"
          title="Bildirim Merkezi"
          description="Önemli her gelişmeden anında haberdar olun."
        />
      </Reveal>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {notifications.map((notification, index) => {
          const Icon = notification.icon;
          return (
            <Reveal key={notification.id} delay={index * 0.06}>
              {/* iOS bildirim balonu */}
              <div
                className={[
                  "flex items-start gap-3 rounded-2xl border bg-white/[0.06] p-4 backdrop-blur-xl",
                  notification.urgent ? "border-brand/30" : "border-white/10",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    notification.urgent
                      ? "bg-brand/15 text-brand"
                      : "bg-navy/50 text-accent",
                  ].join(" ")}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <LogoMark size={14} />
                      <span className="text-xs font-semibold text-content">
                        {notification.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted">
                      {notification.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-snug text-muted">
                    {notification.message}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
