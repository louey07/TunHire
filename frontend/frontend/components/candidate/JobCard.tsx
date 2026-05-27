import Link from "next/link";
import JobCompanySummary from "@/components/candidate/JobCompanySummary";
import { formatSalaryRange } from "@/lib/candidate/jobSearch";
import {
  JobContractBadge,
  JobExperienceBadge,
  JobLocationLine,
  JobSalaryLine,
  JobWorkModeBadge,
} from "@/lib/candidate/jobMeta";
import type { Job } from "@/lib/types";

type CandidateJobCardProps = {
  job: Job;
  selected?: boolean;
  onSelect?: () => void;
  alreadyApplied?: boolean;
  compact?: boolean;
  large?: boolean;
};

export default function CandidateJobCard({
  job,
  selected,
  onSelect,
  alreadyApplied,
  compact = false,
  large = false,
}: CandidateJobCardProps) {
  const salaryLabel = formatSalaryRange(job.salaryMin, job.salaryMax);
  const Wrapper = onSelect ? "button" : "div";
  const showFull = large || !compact;

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      aria-selected={selected}
      className={`surface-section w-full text-left transition editorial-shadow ${
        large ? "rounded-3xl p-6 sm:p-7" : "rounded-2xl p-4"
      } ${
        selected
          ? "ring-2 ring-[color-mix(in_srgb,var(--secondary)_35%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_6%,white)]"
          : "hover:border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] hover:shadow-[0_4px_20px_rgba(0,30,64,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-headline font-bold text-[var(--primary)] ${
              large ? "text-xl sm:text-2xl" : "text-base"
            }`}
          >
            {job.title}
          </h3>
          <JobLocationLine
            location={job.location}
            className={large ? "mt-1.5 text-sm" : "mt-1.5 text-sm"}
          />
        </div>
        {alreadyApplied ? (
          <span className="shrink-0 rounded-full bg-[var(--secondary)]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--secondary)]">
            ✅ Candidature envoyée
          </span>
        ) : null}
      </div>

      {job.companyName && showFull ? (
        <div className={large ? "mt-5" : "mt-3"}>
          <JobCompanySummary job={job} compact={!large} />
        </div>
      ) : job.companyName ? (
        <p className="mt-2 text-xs font-semibold text-[var(--primary)]">
          {job.companyName}
        </p>
      ) : null}

      {showFull && job.description ? (
        <p
          className={`leading-relaxed text-[var(--on-surface-variant)] ${
            large
              ? "mt-5 line-clamp-3 text-sm sm:line-clamp-4 sm:text-base"
              : "mt-3 line-clamp-2 text-sm"
          }`}
        >
          {job.description}
        </p>
      ) : null}

      <div className={`flex flex-wrap gap-2 ${large ? "mt-5" : "mt-3"}`}>
        <JobWorkModeBadge workMode={job.workMode} />
        <JobContractBadge contractType={job.contractType} />
        {job.experienceLevel ? (
          <JobExperienceBadge level={job.experienceLevel} />
        ) : null}
      </div>

      {salaryLabel ? (
        <JobSalaryLine
          label={salaryLabel}
          className={large ? "mt-5 text-lg" : "mt-3 text-sm"}
        />
      ) : null}

      {!onSelect ? (
        <div className={large ? "mt-6" : "mt-4"}>
          <Link
            href={`/jobs/${job.id}`}
            className="text-sm font-semibold text-[var(--secondary)] hover:underline"
          >
            Voir l&apos;offre
          </Link>
        </div>
      ) : null}
    </Wrapper>
  );
}
