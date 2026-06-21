export {
  CONTRACT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_STATUS_LABELS,
  JOB_STATUS_TONES,
  WORK_MODE_OPTIONS,
  experienceLevelLabel,
  isWorkMode,
  normalizeContractType,
  normalizeExperienceLevel,
  workModeLabel,
} from "@/lib/recruiter/jobs";

export type { ContractType } from "@/lib/recruiter/jobs";

import { JOB_STATUS_LABELS, JOB_STATUS_TONES } from "@/lib/recruiter/jobs";

export type JobStatusFilter = "ALL" | "DRAFT" | "OPEN" | "CLOSED";

export const JOB_STATUS_FILTERS: { label: string; value: JobStatusFilter }[] = [
  { label: "Toutes", value: "ALL" },
  { label: "Publiées", value: "OPEN" },
  { label: "Brouillons", value: "DRAFT" },
  { label: "Fermées", value: "CLOSED" },
];

export function getJobStatusUi(status?: string | null) {
  const key = String(status || "DRAFT").toUpperCase();
  return {
    label: JOB_STATUS_LABELS[key] || key,
    tone: JOB_STATUS_TONES[key] || JOB_STATUS_TONES.DRAFT,
    dot:
      key === "OPEN"
        ? "bg-[#22c55e]"
        : key === "CLOSED"
          ? "bg-[#93000a]"
          : "bg-[#94a3b8]",
  };
}
