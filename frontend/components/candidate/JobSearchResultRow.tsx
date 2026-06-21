"use client";

import JobCompanySummary from "@/components/candidate/JobCompanySummary";
import { formatSalaryRange } from "@/lib/candidate/jobSearch";
import { workModeLabel } from "@/lib/recruiter/jobs";
import type { Job } from "@/lib/types";
type JobSearchResultRowProps = {
  job: Job;
  selected?: boolean;
  onSelect: () => void;
};

export default function JobSearchResultRow({
  job,
  selected,
  onSelect,
}: JobSearchResultRowProps) {
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full border-b border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] px-5 py-5 text-left transition last:border-b-0 xl:px-6 xl:py-6 ${
        selected
          ? "bg-[color-mix(in_srgb,var(--primary)_5%,white)] before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-[var(--primary)]"
          : "bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)]"
      }`}
    >
      <h3 className="pr-4 text-lg font-bold leading-snug text-[var(--primary)]">
        {job.title}
      </h3>
      <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
        {job.location}
      </p>
      {job.companyName ? (
        <div className="mt-3">
          <JobCompanySummary job={job} compact />
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-md bg-[var(--surface-container-high)] px-2 py-0.5 text-xs font-medium text-[var(--on-surface-variant)]">
          {workModeLabel(job.workMode)}
        </span>
        {job.contractType ? (
          <span className="rounded-md bg-[var(--surface-container-high)] px-2 py-0.5 text-xs font-medium text-[var(--on-surface-variant)]">
            {job.contractType}
          </span>
        ) : null}
        {job.experienceLevel ? (
          <span className="rounded-md bg-[var(--surface-container-high)] px-2 py-0.5 text-xs font-medium text-[var(--on-surface-variant)]">
            {job.experienceLevel}
          </span>
        ) : null}
      </div>
      {salary ? (
        <p className="mt-2 text-sm font-medium text-[var(--on-surface)]">
          {salary}
        </p>
      ) : null}
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--on-surface-variant)]">
        {job.description}
      </p>
    </button>
  );
}
