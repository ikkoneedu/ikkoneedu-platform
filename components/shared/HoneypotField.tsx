import { HONEYPOT_FIELD } from "@/lib/security/spam-protection";

/**
 * Honeypot alanı — bot tuzağı.
 * Görsel olarak ve ekran okuyuculardan gizlidir; gerçek kullanıcılar doldurmaz.
 * Bot doldurursa form gönderimi reddedilir.
 */
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Bu alanı boş bırakın</label>
      <input
        type="text"
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
