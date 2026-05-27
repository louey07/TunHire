import type { Job, WorkMode } from "@/lib/types";

export type JobSearchFilterState = {
  workModes: WorkMode[];
  contractTypes: string[];
  experienceLevels: string[];
};

export const emptyJobSearchFilters: JobSearchFilterState = {
  workModes: [],
  contractTypes: [],
  experienceLevels: [],
};

export type FilterOption = {
  value: string;
  label: string;
  count: number;
};

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string | null | undefined,
): FilterOption[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item)?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fr"));
}

export function buildFilterOptions(jobs: Job[]) {
  return {
    workModes: countBy(jobs, (job) => job.workMode || "ON_SITE"),
    contractTypes: countBy(jobs, (job) => job.contractType),
    experienceLevels: countBy(jobs, (job) => job.experienceLevel),
  };
}

export function applyJobSearchFilters(
  jobs: Job[],
  keyword: string,
  locationQuery: string,
  filters: JobSearchFilterState,
): Job[] {
  const keywordLower = keyword.trim().toLowerCase();
  const locationLower = locationQuery.trim().toLowerCase();

  return jobs.filter((job) => {
    if (keywordLower) {
      const haystack = [
        job.title,
        job.companyName,
        job.companyDescription,
        job.description,
        job.contractType,
        job.experienceLevel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(keywordLower)) return false;
    }

    if (locationLower && !job.location.toLowerCase().includes(locationLower)) {
      return false;
    }

    if (
      filters.workModes.length &&
      !filters.workModes.includes((job.workMode || "ON_SITE") as WorkMode)
    ) {
      return false;
    }

    if (
      filters.contractTypes.length &&
      !filters.contractTypes.some(
        (value) =>
          job.contractType?.toLowerCase() === value.toLowerCase(),
      )
    ) {
      return false;
    }

    if (
      filters.experienceLevels.length &&
      !filters.experienceLevels.some(
        (value) =>
          job.experienceLevel?.toLowerCase() === value.toLowerCase(),
      )
    ) {
      return false;
    }

    return true;
  });
}

export function toggleFilterValue(
  current: string[],
  value: string,
): string[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

export function countActiveFilters(filters: JobSearchFilterState) {
  return (
    filters.workModes.length +
    filters.contractTypes.length +
    filters.experienceLevels.length
  );
}

export function formatSalaryRange(min?: number | null, max?: number | null) {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min} – ${max} DT / mois`;
  if (min != null) return `À partir de ${min} DT / mois`;
  return `Jusqu'à ${max} DT / mois`;
}
