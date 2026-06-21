import Link from "next/link";
import StatusChip from "@/components/StatusChip";
import JobCompanySummary from "@/components/candidate/JobCompanySummary";
import {
  formatRelativeDate,
  getApplicationStatusUi,
} from "@/lib/status/applications";
import type { Application, Job } from "@/lib/types";

type ApplicationCardProps = {
  application: Application;
  job?: Job;
  compact?: boolean;
  onDelete?: (applicationId: number) => void | Promise<void>;
  deleting?: boolean;
};

export default function ApplicationCard({
  application,
  job,
  compact = false,
  onDelete,
  deleting = false,
}: ApplicationCardProps) {
  const title = job?.title ?? "Poste confidentiel";
  const statusUi = getApplicationStatusUi(application.status);
  const isShortlisted =
    String(application.status).toUpperCase() === "SHORTLISTED";

  return (
    <article
      className={`surface-section overflow-hidden editorial-shadow transition hover:border-[color-mix(in_srgb,var(--secondary)_20%,transparent)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      {isShortlisted ? (
        <div className="mb-3 rounded-xl bg-[var(--secondary)]/10 px-3 py-2 text-xs font-semibold text-[var(--secondary)]">
          Profil retenu — le recruteur pourrait vous contacter.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-headline text-lg font-bold text-[var(--primary)]">
                {title}
              </h3>
              {job?.companyName ? (
                <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                  {job.companyName}
                  {job.location ? ` · ${job.location}` : ""}
                </p>
              ) : null}
            </div>
            <StatusChip status={application.status} />
          </div>

          {job?.companyName && !compact ? (
            <div className="mt-4">
              <JobCompanySummary job={job} compact />
            </div>
          ) : null}

          <p className="mt-3 text-xs text-[var(--on-surface-variant)]">
            Candidature {formatRelativeDate(application.createdAt)}
            {!compact ? (
              <span className="ml-2">· {statusUi.description}</span>
            ) : null}
          </p>
        </div>
      </div>

      {!compact && application.jobId ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] pt-4">
          <Link
            href={`/jobs/${application.jobId}`}
            className="text-sm font-semibold text-[var(--secondary)] hover:underline"
          >
            Voir l&apos;offre →
          </Link>
          {onDelete ? (
            <button
              type="button"
              disabled={deleting}
              onClick={() => void onDelete(application.id)}
              className="rounded-full bg-[#ffdad6] px-4 py-2 text-xs font-semibold text-[#93000a] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Suppression…" : "Retirer ma candidature"}
            </button>
          ) : null}
        </div>
      ) : compact && onDelete ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={deleting}
            onClick={() => void onDelete(application.id)}
            className="text-xs font-semibold text-[#93000a] hover:underline disabled:opacity-50"
          >
            {deleting ? "Suppression…" : "Retirer"}
          </button>
        </div>
      ) : null}
    </article>
  );
}
