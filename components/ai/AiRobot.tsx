"use client";

/**
 * IKK ONE EDU yapay zekâ maskotu — tatlı, şirin, kurumsal robot.
 * Saf SVG + CSS animasyon (süzülme, anten nabzı, göz parıltısı/blink).
 * Tema-duyarlı (accent/brand token'ları). `thinking` modunda hızlanır.
 */
export function AiRobot({
  size = 96,
  thinking = false,
  className = "",
}: {
  size?: number;
  thinking?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`ai-robot ${thinking ? "ai-robot--think" : ""} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="botBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="botGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* yumuşak hale */}
        <circle cx="60" cy="58" r="46" fill="url(#botGlow)" />

        {/* anten */}
        <line x1="60" y1="14" x2="60" y2="30" stroke="rgb(var(--color-accent))" strokeWidth="3" strokeLinecap="round" />
        <circle className="ai-robot__antenna" cx="60" cy="12" r="5" fill="rgb(var(--color-brand))" />

        {/* kafa */}
        <rect x="26" y="28" width="68" height="56" rx="20" fill="url(#botBody)" stroke="rgb(var(--color-accent))" strokeOpacity="0.4" strokeWidth="2" />

        {/* yan kulaklar */}
        <rect x="18" y="48" width="9" height="18" rx="4" fill="rgb(var(--color-accent))" fillOpacity="0.7" />
        <rect x="93" y="48" width="9" height="18" rx="4" fill="rgb(var(--color-accent))" fillOpacity="0.7" />

        {/* yüz ekranı */}
        <rect x="34" y="38" width="52" height="36" rx="14" fill="rgb(var(--color-background))" fillOpacity="0.9" />

        {/* gözler */}
        <g className="ai-robot__eyes" fill="rgb(var(--color-accent))">
          <circle cx="48" cy="54" r="6" />
          <circle cx="72" cy="54" r="6" />
        </g>
        {/* parıltı */}
        <circle cx="46" cy="52" r="1.8" fill="#fff" />
        <circle cx="70" cy="52" r="1.8" fill="#fff" />

        {/* tatlı gülümseme */}
        <path d="M50 64 Q60 71 70 64" stroke="rgb(var(--color-accent))" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* yanak pembeliği */}
        <circle cx="40" cy="63" r="3" fill="rgb(var(--color-brand))" fillOpacity="0.4" />
        <circle cx="80" cy="63" r="3" fill="rgb(var(--color-brand))" fillOpacity="0.4" />

        {/* gövde */}
        <rect x="40" y="86" width="40" height="22" rx="11" fill="url(#botBody)" stroke="rgb(var(--color-accent))" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="60" cy="97" r="4" fill="rgb(var(--color-brand))" fillOpacity="0.7" />
      </svg>
    </div>
  );
}
