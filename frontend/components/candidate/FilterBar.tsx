"use client";

import type { JobSearchFilterState } from "@/lib/candidate/jobSearch";
import { WORK_MODE_OPTIONS } from "@/lib/status/jobs";

type FilterBarProps = {
  filters: JobSearchFilterState;
  resultCount: number;
  onRemoveWorkMode: (mode: string) => void;
  onRemoveExperience: (level: string) => void;
  onRemoveContract: (type: string) => void;
  onClearAll: () => void;
};

export default function FilterBar({
  filters,
  resultCount,
  onRemoveWorkMode,
  onRemoveExperience,
  onRemoveContract,
  onClearAll,
}: FilterBarProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  filters.workModes.forEach((mode) => {
    const label =
      WORK_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? mode;
    chips.push({
      key: `wm-${mode}`,
      label,
      onRemove: () => onRemoveWorkMode(mode),
    });
  });
  filters.experienceLevels.forEach((level) => {
    chips.push({
      key: `exp-${level}`,
      label: level,
      onRemove: () => onRemoveExperience(level),
    });
  });
  filters.contractTypes.forEach((type) => {
    chips.push({
      key: `ct-${type}`,
      label: type,
      onRemove: () => onRemoveContract(type),
    });
  });

  if (chips.length === 0) {
    return (
      <p className="text-sm text-[var(--on-surface-variant)]">
        <span className="text-lg font-bold text-[var(--primary)]">
          {resultCount}
        </span>{" "}
        offre{resultCount !== 1 ? "s" : ""}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-2 text-sm text-[var(--on-surface-variant)]">
        <span className="font-bold text-[var(--primary)]">{resultCount}</span>{" "}
        résultat{resultCount !== 1 ? "s" : ""}
      </p>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--secondary)_25%,transparent)] bg-[var(--secondary)]/8 px-3 py-1 text-xs font-semibold text-[var(--primary)]"
        >
          {chip.label}
          <span aria-hidden>×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-[var(--secondary)] hover:underline"
      >
        Tout effacer
      </button>
    </div>
  );
}
