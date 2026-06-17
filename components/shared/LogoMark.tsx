import type { SVGProps } from "react";

interface LogoMarkProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * ikkoneedu marka simgesi.
 * Lacivert zemin üzerine marka kırmızısı vurgulu sade bir işaret.
 */
export function LogoMark({ size = 40, ...props }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="ikkoneedu logosu"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="48" height="48" rx="12" fill="#0A2342" />
      <rect x="13" y="13" width="6" height="22" rx="3" fill="#E3E2E5" />
      <path
        d="M22 24L31 14"
        stroke="#D62839"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M22 24L31 34"
        stroke="#B2C7EF"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
