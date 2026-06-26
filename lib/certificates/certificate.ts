/**
 * Sertifika & Belge üretici (SAF MANTIK, demo-safe).
 *
 * Seri numarası içerikten deterministik üretilir (aynı belge → aynı seri),
 * böylece QR ile doğrulanabilir bir "demo" akışı kurulur. Gerçek imza/blok
 * zinciri doğrulaması YOK; bu bir tanıtım/demo üreticisidir.
 */

export const CERTIFICATE_TYPES = [
  "achievement",
  "participation",
  "appreciation",
  "completion",
] as const;
export type CertificateType = (typeof CERTIFICATE_TYPES)[number];

export interface CertificateInput {
  type: CertificateType;
  /** Belgeyi alan kişi (öğrenci/katılımcı). */
  recipient: string;
  /** Başlık / etkinlik / başarı konusu. */
  title: string;
  /** Tarih (serbest metin: "15 Mayıs 2026"). */
  date: string;
  /** Veren kurum / okul adı. */
  issuer: string;
  /** Opsiyonel ek açıklama. */
  note?: string;
}

/** djb2 — basit, deterministik string hash. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0; // unsigned
}

/** İçerikten deterministik seri no üretir: IKK-CERT-XXXXXX. */
export function buildSerial(input: CertificateInput): string {
  const base = [
    input.type,
    input.recipient.trim(),
    input.title.trim(),
    input.date.trim(),
    input.issuer.trim(),
  ]
    .join("|")
    .toLowerCase();
  const code = hashString(base).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return `IKK-CERT-${code}`;
}

/** QR'a kodlanacak doğrulama yükü (boru ile ayrık, demo). */
export function buildVerifyPayload(serial: string, input: CertificateInput): string {
  return [
    "IKK-CERT",
    serial,
    input.recipient.trim(),
    input.title.trim(),
    input.date.trim(),
  ].join("|");
}
