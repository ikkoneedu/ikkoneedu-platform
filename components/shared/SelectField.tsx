interface SelectFieldProps {
  label: string;
  items: string[];
  className?: string;
  name?: string;
  /** Kontrollü kullanım (opsiyonel). Verilmezse defaultValue ile çalışır. */
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Form seçim alanı (native select).
 * Premium cam yüzeyli, etiketli ve erişilebilir bir açılır liste sağlar.
 * Kontrollü (value+onChange) veya kontrolsüz (defaultValue) kullanılabilir.
 */
export function SelectField({ label, items, className = "", name, value, onChange }: SelectFieldProps) {
  const controlled = value !== undefined;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-muted">{label}</label>
      <select
        aria-label={label}
        name={name}
        {...(controlled ? { value, onChange } : { defaultValue: items[0] })}
        className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      >
        {items.map((item) => (
          <option key={item} className="bg-surface text-content">
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
