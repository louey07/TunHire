"use client";

import {
  companyInitials,
  formatWebsiteDisplay,
  normalizeWebsiteUrl,
} from "@/lib/recruiter/company";
import type { Job } from "@/lib/types";

type CompanyAboutSectionProps = {
  job: Job;
};

export default function CompanyAboutSection({ job }: CompanyAboutSectionProps) {
  const companyName = job.companyName?.trim();
  if (!companyName) return null;

  const description = job.companyDescription?.trim();
  const websiteLabel = formatWebsiteDisplay(job.companyWebsite);
  const websiteHref = job.companyWebsite
    ? normalizeWebsiteUrl(job.companyWebsite)
    : null;

  const hasDetails =
    Boolean(description) ||
    Boolean(job.companyLocation) ||
    Boolean(websiteHref);

  if (!hasDetails && !companyName) return null;

  return (
    <section className="surface-card rounded-3xl p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
        À propos de l&apos;entreprise
      </p>

      <div className="mt-5 flex flex-wrap items-start gap-4">
        {job.companyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.companyLogoUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl bg-white object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] font-headline text-lg font-bold text-white">
            {companyInitials(companyName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="font-headline text-xl font-bold text-[var(--primary)]">
            {companyName}
          </h2>

          {job.companyLocation ? (
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
              {job.companyLocation}
            </p>
          ) : null}

          {websiteLabel && websiteHref ? (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-[var(--secondary)] hover:underline"
            >
              {websiteLabel}
            </a>
          ) : null}
        </div>
      </div>

      {description ? (
        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--on-surface-variant)]">
          {description}
        </p>
      ) : (
        <p className="mt-5 text-sm text-[var(--on-surface-variant)]">
          Cette entreprise n&apos;a pas encore renseigné de description publique.
        </p>
      )}
    </section>
  );
}
