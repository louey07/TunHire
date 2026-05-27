import Link from "next/link";
import { workModeLabel } from "@/lib/recruiter/jobs";
import type { Job } from "@/lib/types";

type JobCardProps = {
  job: Job;
  selected?: boolean;
  onSelect?: () => void;
  onApply?: () => void;
  isApplying?: boolean;
  alreadyApplied?: boolean;
};

export default function JobCard({
  job,
  selected,
  onSelect,
  onApply,
  isApplying,
  alreadyApplied,
}: JobCardProps) {
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      className={`surface-card w-full rounded-3xl p-5 text-left transition ${
        selected
          ? "bg-[var(--surface-container-lowest)] editorial-shadow ring-2 ring-[color-mix(in_srgb,var(--secondary)_35%,transparent)]"
          : "hover:bg-[var(--surface-container-lowest)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-headline text-base font-semibold text-[var(--primary)]">
          {job.title}
        </h3>
        <div className="flex flex-wrap justify-end gap-2">
          {job.workMode ? (
            <span className="rounded-full bg-[var(--surface-container-high)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--on-surface-variant)]">
              {workModeLabel(job.workMode)}
            </span>
          ) : null}
          <span className="rounded-full bg-[var(--surface-container-high)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--on-surface-variant)]">
            {job.contractType}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        {job.companyName ? `${job.companyName} · ` : ""}
        {job.location}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
        {job.description.slice(0, 120)}
        {job.description.length > 120 ? "…" : ""}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-semibold text-[var(--secondary)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Voir l&apos;offre
        </Link>
        {onApply ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
            disabled={isApplying || alreadyApplied}
            className="btn-primary ml-auto rounded-2xl px-4 py-2 text-sm disabled:opacity-60"
          >
            {alreadyApplied
              ? "Candidature envoyée"
              : isApplying
                ? "Envoi…"
                : "Postuler"}
          </button>
        ) : null}
      </div>
    </Wrapper>
  );
}
