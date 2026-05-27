import type { WorkMode } from "@/lib/types";

export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  OPEN: "Publiée",
  CLOSED: "Fermée",
};

export const JOB_STATUS_TONES: Record<string, string> = {
  DRAFT: "bg-[#e0e3e5] text-[#43474f]",
  OPEN: "bg-[#001e40] text-white",
  CLOSED: "bg-[#93000a]/10 text-[#93000a]",
};

export const CONTRACT_TYPE_OPTIONS = [
  "CDI",
  "CDD",
  "Stage",
  "CIVP",
  "Freelance",
] as const;

export type ContractType = (typeof CONTRACT_TYPE_OPTIONS)[number];

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "STAGIAIRE", label: "Stagiaire" },
  { value: "JUNIOR", label: "Junior" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire" },
  { value: "SENIOR", label: "Senior" },
] as const;

export type ExperienceLevel =
  (typeof EXPERIENCE_LEVEL_OPTIONS)[number]["value"];

export function experienceLevelLabel(value?: string | null) {
  if (!value) return "";
  const match = EXPERIENCE_LEVEL_OPTIONS.find((option) => option.value === value);
  return match?.label ?? value;
}

export function normalizeExperienceLevel(value?: string | null): string {
  if (!value) return "";
  const upper = value.trim().toUpperCase();
  const match = EXPERIENCE_LEVEL_OPTIONS.find((option) => option.value === upper);
  return match?.value ?? value.trim();
}

export const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: "ON_SITE", label: "Sur site" },
  { value: "HYBRID", label: "Hybride" },
  { value: "REMOTE", label: "Télétravail" },
];

const WORK_MODE_LABELS: Record<WorkMode, string> = {
  ON_SITE: "Sur site",
  HYBRID: "Hybride",
  REMOTE: "Télétravail",
};

export function workModeLabel(mode?: WorkMode | string | null) {
  if (mode === "ON_SITE" || mode === "HYBRID" || mode === "REMOTE") {
    return WORK_MODE_LABELS[mode];
  }
  return "Sur site";
}

export function isWorkMode(value: string): value is WorkMode {
  return value === "ON_SITE" || value === "HYBRID" || value === "REMOTE";
}

export function normalizeContractType(value?: string | null): ContractType {
  if (!value) return "CDI";
  const match = CONTRACT_TYPE_OPTIONS.find(
    (option) => option.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? "CDI";
}
