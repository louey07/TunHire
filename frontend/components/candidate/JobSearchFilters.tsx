"use client";

import { useEffect, useId, useRef, useState } from "react";
import { WORK_MODE_OPTIONS } from "@/lib/status/jobs";
import type { FilterOption, JobSearchFilterState } from "@/lib/candidate/jobSearch";
import type { WorkMode } from "@/lib/types";

type JobSearchFiltersProps = {
  filters: JobSearchFilterState;
  options: {
    workModes: FilterOption[];
    contractTypes: FilterOption[];
    experienceLevels: FilterOption[];
  };
  onChange: (filters: JobSearchFilterState) => void;
  onClear: () => void;
  activeCount: number;
  layout?: "sidebar" | "horizontal";
};

type DropdownOption = {
  value: string;
  label: string;
  count?: number;
};

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function formatSelectedSummary(
  selected: string[],
  options: DropdownOption[],
): string | null {
  if (selected.length === 0) return null;

  const labels = selected
    .map((value) => options.find((option) => option.value === value)?.label ?? value)
    .filter(Boolean);

  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      className={`shrink-0 text-[var(--on-surface-variant)] transition-transform ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="M6 8L1 3h10z" />
    </svg>
  );
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: DropdownOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const summary = formatSelectedSummary(selected, options);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (options.length === 0) return null;

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={`input-soft flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
          selected.length > 0
            ? "border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
            : ""
        }`}
      >
        <span className="min-w-0">
          <span className="block font-semibold text-[var(--primary)]">{label}</span>
          <span
            className={`mt-0.5 block truncate text-xs ${
              summary
                ? "font-medium text-[var(--on-surface)]"
                : "text-[var(--on-surface-variant)]"
            }`}
          >
            {summary ?? "Tous"}
          </span>
        </span>
        <span className="flex items-center gap-2">
          {selected.length > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-bold text-[var(--on-primary)]">
              {selected.length}
            </span>
          ) : null}
          <ChevronIcon open={open} />
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
          className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)] bg-[var(--surface-container-lowest)] py-1 shadow-[0_8px_24px_rgba(0,30,64,0.12)]"
        >
          {options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-[var(--surface-container-low)]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(toggleInList(selected, option.value))
                  }
                  className="h-4 w-4 rounded border-[color-mix(in_srgb,var(--outline-variant)_35%,transparent)] accent-[var(--primary)]"
                />
                <span className="min-w-0 flex-1 text-sm text-[var(--on-surface)]">
                  {option.label}
                </span>
                {option.count != null && option.count > 0 ? (
                  <span className="text-xs text-[var(--on-surface-variant)]">
                    ({option.count})
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FilterDropdowns({
  filters,
  options,
  onChange,
  onClear,
  activeCount,
  compactHeader,
}: Omit<JobSearchFiltersProps, "layout"> & { compactHeader?: boolean }) {
  const workModeCounts = new Map(
    options.workModes.map((option) => [option.value, option.count]),
  );

  const workModeOptions: DropdownOption[] = WORK_MODE_OPTIONS.flatMap(
    (option) => {
      const count = workModeCounts.get(option.value) || 0;
      if (count === 0) return [];
      return [{ value: option.value, label: option.label, count }];
    },
  );

  const contractOptions: DropdownOption[] = options.contractTypes.map(
    (option) => ({
      value: option.value,
      label: option.label,
      count: option.count,
    }),
  );

  const experienceOptions: DropdownOption[] = options.experienceLevels.map(
    (option) => ({
      value: option.value,
      label: option.label,
      count: option.count,
    }),
  );

  return (
    <div
      className={`rounded-2xl border border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-lowest)] shadow-[0_1px_4px_rgba(0,30,64,0.06)] ${
        compactHeader ? "p-5" : "px-4 py-4 sm:px-5 sm:py-5"
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${
          compactHeader ? "border-b border-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)] pb-4" : "mb-4"
        }`}
      >
        <div>
          <p className="font-headline text-base font-bold text-[var(--primary)]">
            Filtres
          </p>
          {activeCount > 0 ? (
            <p className="mt-0.5 text-xs text-[var(--on-surface-variant)]">
              {activeCount} filtre{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-[var(--secondary)] hover:underline"
          >
            {compactHeader ? "Effacer" : "Tout effacer"}
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <MultiSelectDropdown
          label="Mode de travail"
          options={workModeOptions}
          selected={filters.workModes}
          onChange={(workModes) =>
            onChange({
              ...filters,
              workModes: workModes as WorkMode[],
            })
          }
        />

        <MultiSelectDropdown
          label="Contrat"
          options={contractOptions}
          selected={filters.contractTypes}
          onChange={(contractTypes) =>
            onChange({
              ...filters,
              contractTypes,
            })
          }
        />

        <MultiSelectDropdown
          label="Expérience"
          options={experienceOptions}
          selected={filters.experienceLevels}
          onChange={(experienceLevels) =>
            onChange({
              ...filters,
              experienceLevels,
            })
          }
        />
      </div>
    </div>
  );
}

export default function JobSearchFilters({
  layout = "horizontal",
  ...props
}: JobSearchFiltersProps) {
  return (
    <FilterDropdowns
      {...props}
      compactHeader={layout === "sidebar"}
    />
  );
}
