type StatusFilterPillsProps<T extends string> = {
  options: { label: string; value: T; count?: number }[];
  activeValue: T;
  onChange: (value: T) => void;
};

export default function StatusFilterPills<T extends string>({
  options,
  activeValue,
  onChange,
}: StatusFilterPillsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = activeValue === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              active
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                : "border-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)] bg-[var(--surface-container-lowest)] text-[var(--on-surface-variant)] hover:border-[color-mix(in_srgb,var(--secondary)_30%,transparent)]"
            }`}
          >
            {option.label}
            {option.count != null ? (
              <span className="ml-1.5 opacity-70">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
