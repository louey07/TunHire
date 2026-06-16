import { experienceLevelLabel, workModeLabel } from "@/lib/status/jobs";
import type { WorkMode } from "@/lib/types";

export function workModeEmoji(mode?: WorkMode | string | null) {
  if (mode === "REMOTE") return "🏠";
  if (mode === "HYBRID") return "🔀";
  return "🏢";
}

export const JOB_META = {
  location: "📍",
  contract: "📃",
  experience: "🎓",
  salary: "💰",
  description: "📝",
  company: "🏛️",
} as const;

type JobMetaBadgeProps = {
  emoji: string;
  label: string;
  className?: string;
};

export function JobMetaBadge({ emoji, label, className = "" }: JobMetaBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-container-high)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)] ${className}`}
    >
      <span aria-hidden className="text-xs normal-case">
        {emoji}
      </span>
      {label}
    </span>
  );
}

export function JobWorkModeBadge({
  workMode,
  className,
}: {
  workMode?: WorkMode | string | null;
  className?: string;
}) {
  if (!workMode) return null;
  return (
    <JobMetaBadge
      emoji={workModeEmoji(workMode)}
      label={workModeLabel(workMode)}
      className={className}
    />
  );
}

export function JobContractBadge({
  contractType,
  className,
}: {
  contractType: string;
  className?: string;
}) {
  return (
    <JobMetaBadge
      emoji={JOB_META.contract}
      label={contractType}
      className={className}
    />
  );
}

export function JobExperienceBadge({
  level,
  className,
}: {
  level: string;
  className?: string;
}) {
  return (
    <JobMetaBadge
      emoji={JOB_META.experience}
      label={experienceLevelLabel(level)}
      className={className}
    />
  );
}

export function JobLocationLine({
  location,
  className = "",
}: {
  location: string;
  className?: string;
}) {
  return (
    <p className={`text-[var(--on-surface-variant)] ${className}`}>
      <span aria-hidden className="mr-1.5">
        {JOB_META.location}
      </span>
      {location}
    </p>
  );
}

export function JobSalaryLine({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <p className={`font-semibold text-[var(--primary)] ${className}`}>
      <span aria-hidden className="mr-1.5">
        {JOB_META.salary}
      </span>
      {label}
    </p>
  );
}