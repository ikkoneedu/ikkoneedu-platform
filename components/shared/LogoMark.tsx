import type { SVGProps } from "react";
import { productName } from "@/lib/constants";

interface LogoMarkProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number;
}

/**
 * ikkoneedu marka simgesi.
 * Lacivert zemin üzerine marka kırmızısı ve aksan mavisi vurgulu sade işaret.
 */
export function LogoMark({ size = 40, ...props }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={`${productName} logosu`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="48" height="48" rx="12" fill="#0A2342" />
      <rect
        x="0.5"
        y="0.5"
        width="47"
        height="47"
        rx="11.5"
        stroke="white"
        strokeOpacity="0.1"
      />
      <rect x="13" y="13" width="6" height="22" rx="3" fill="#E3E2E5" />
      <path d="M22 24L31 14" stroke="#D62839" strokeWidth="6" strokeLinecap="round" />
      <path d="M22 24L31 34" stroke="#B2C7EF" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

interface LogoProps {
  /** Simge boyutu (px). */
  size?: number;
  /** Ürün adını simgenin yanında gösterir. */
  showWordmark?: boolean;
  className?: string;
}

/**
 * Logo + kelime işareti (wordmark) birleşimi.
 * Sidebar ve topbar gibi marka alanlarında kullanılır.
 */
export function Logo({ size = 32, showWordmark = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-content">
          {productName}
        </span>
      )}
    </div>
  );
}
