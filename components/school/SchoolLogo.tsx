import { LogoMark } from "@/components/shared/LogoMark";

/** Geçerli http(s) görsel URL'i mi? */
function isValidLogo(url: string): boolean {
  return /^https?:\/\/.+/i.test(url.trim());
}

/**
 * Okul logosu — geçerli bir logo URL'i varsa görseli, yoksa marka rengiyle
 * çerçevelenmiş varsayılan LogoMark'ı gösterir. White-label kimliği için.
 */
export function SchoolLogo({
  logo,
  brand,
  size = 40,
  name,
  rounded = "rounded-xl",
}: {
  logo: string;
  brand: string;
  size?: number;
  name: string;
  rounded?: string;
}) {
  if (isValidLogo(logo)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`${name} logosu`}
        width={size}
        height={size}
        className={`${rounded} object-contain`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`flex items-center justify-center ${rounded}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `${brand}22`,
        border: `1px solid ${brand}55`,
      }}
    >
      <LogoMark size={Math.round(size * 0.62)} />
    </span>
  );
}
