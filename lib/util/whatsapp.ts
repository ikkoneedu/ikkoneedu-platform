/**
 * WhatsApp doğrudan mesaj bağlantısı (wa.me). Telefon uluslararası biçime
 * (TR varsayılan +90) normalize edilir. Geçersizse null döner.
 */
export function whatsappLink(phone: string, text = ""): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  let intl = digits;
  if (intl.startsWith("0")) intl = `90${intl.slice(1)}`;
  else if (intl.length === 10) intl = `90${intl}`; // 5xx… → +90
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${intl}${q}`;
}
