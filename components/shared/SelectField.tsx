interface SelectFieldProps {
  label: string;
  items: string[];
  className?: string;
}

/**
 * Form seçim alanı (native select).
 * Premium cam yüzeyli, etiketli ve erişilebilir bir açılır liste sağlar.
 */
export function SelectField({ label, items, className = "" }: SelectFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-muted">{label}</label>
      <select
        aria-label={label}
        defaultValue={items[0]}
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
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
