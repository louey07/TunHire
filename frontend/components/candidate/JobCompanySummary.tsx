"use client";

import Link from "next/link";
import {
  companyInitials,
  formatWebsiteDisplay,
  normalizeWebsiteUrl,
} from "@/lib/recruiter/company";
import type { Job } from "@/lib/types";

type JobCompanySummaryProps = {
  job: Job;
  compact?: boolean;
};

export default function JobCompanySummary({
  job,
  compact = false,
}: JobCompanySummaryProps) {
  const companyName = job.companyName?.trim();
  if (!companyName) return null;

  const websiteLabel = formatWebsiteDisplay(job.companyWebsite);
  const websiteHref = job.companyWebsite
    ? normalizeWebsiteUrl(job.companyWebsite)
    : null;
  const description = job.companyDescription?.trim();

  return (
    <div
      className={`flex gap-3 ${compact ? "items-center" : "items-start"} rounded-xl bg-[var(--surface-container-low)] p-3`}
    >
      {job.companyLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={job.companyLogoUrl}
          alt=""
          className={`shrink-0 rounded-lg bg-white object-cover ${
            compact ? "h-10 w-10" : "h-12 w-12"
          }`}
        />
      ) : (
        <div
          className={`flex shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] font-headline text-sm font-bold text-white ${
            compact ? "h-10 w-10" : "h-12 w-12"
          }`}
        >
          {companyInitials(companyName)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {job.companySlug ? (
            <Link
              href={`/companies/${job.companySlug}`}
              className="text-sm font-bold text-[var(--primary)] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {companyName}
            </Link>
          ) : (
            <p className="text-sm font-bold text-[var(--primary)]">
              {companyName}
            </p>
          )}
          {job.companyLocation ? (
            <span className="text-xs text-[var(--on-surface-variant)]">
              · {job.companyLocation}
            </span>
          ) : null}
        </div>

        {!compact && description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--on-surface-variant)]">
            {description}
          </p>
        ) : null}

        {!compact && websiteLabel && websiteHref ? (
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-semibold text-[var(--secondary)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {websiteLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
