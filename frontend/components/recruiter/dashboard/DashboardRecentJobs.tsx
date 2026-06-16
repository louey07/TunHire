"use client";

import Link from "next/link";
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_TONES,
  workModeLabel,
} from "@/lib/recruiter/jobs";
import type { RecruiterJobSummary } from "@/lib/types";

type DashboardRecentJobsProps = {
  jobs: RecruiterJobSummary[];
};

export default function DashboardRecentJobs({ jobs }: DashboardRecentJobsProps) {
  return (
    <section className="surface-section p-6 editorial-shadow">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-xl font-bold text-[var(--primary)]">
            Offres récentes
          </h2>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            Accès rapide à vos dernières offres.
          </p>
        </div>
        <Link
          href="/dashboard/recruiter/jobs"
          className="text-sm font-semibold text-[var(--secondary)] hover:underline"
        >
          Toutes les offres →
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-[var(--surface-container-low)] p-8 text-center">
          <p className="text-sm text-[var(--on-surface-variant)]">
            Aucune offre pour le moment.
          </p>
          <Link
            href="/dashboard/recruiter/jobs/new"
            className="btn-primary mt-4 inline-block rounded-full px-5 py-2 text-sm"
          >
            Publier une offre
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {jobs.map((job) => {
            const status = String(job.status);
            return (
              <li
                key={job.id}
                className="rounded-2xl bg-[var(--surface-container-low)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--primary)]">
                        {job.title}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${JOB_STATUS_TONES[status] || JOB_STATUS_TONES.DRAFT}`}
                      >
                        {JOB_STATUS_LABELS[status] || status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                      {job.location}
                      {job.workMode ? (
                        <span className="ml-2 text-xs">
                          · {workModeLabel(job.workMode)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <Link
                    href={`/dashboard/recruiter/jobs/${job.id}/edit`}
                    className="font-semibold text-[var(--secondary)] hover:underline"
                  >
                    Modifier
                  </Link>
                  <Link
                    href={`/dashboard/recruiter/candidates?jobId=${job.id}`}
                    className="font-semibold text-[var(--secondary)] hover:underline"
                  >
                    Candidats
                  </Link>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-semibold text-[var(--secondary)] hover:underline"
                  >
                    Aperçu public
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
