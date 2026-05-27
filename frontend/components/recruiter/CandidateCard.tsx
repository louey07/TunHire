"use client";

import Link from "next/link";
import type { ApplicationStatus, EnrichedRankedApplication } from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  RECRUITER_STATUS_ACTIONS,
  formatApplicationDate,
  formatCandidateName,
  scoreLevelLabel,
} from "@/lib/recruiter/candidates";

type CandidateCardProps = {
  application: EnrichedRankedApplication;
  updating?: boolean;
  onStatusChange: (applicationId: number, status: ApplicationStatus) => void;
};

function CompatibilityScore({
  score,
  level,
}: {
  score: number | null;
  level: string | null;
}) {
  if (score == null) {
    return (
      <span className="rounded-full bg-[var(--surface-container-high)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
        Score IA indisponible
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 12%, transparent), color-mix(in srgb, var(--tertiary-fixed) 18%, transparent))",
        }}
      >
        <span className="font-headline text-lg font-extrabold text-[var(--primary)]">
          {score}%
        </span>
        <span className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
          Compatibilité IA
        </span>
      </div>
      {level ? (
        <span className="text-[10px] font-medium text-[var(--on-surface-variant)]">
          {scoreLevelLabel(level)}
        </span>
      ) : null}
    </div>
  );
}

export default function CandidateCard({
  application,
  updating = false,
  onStatusChange,
}: CandidateCardProps) {
  const name = formatCandidateName(
    application.candidateFirstName,
    application.candidateLastName,
  );
  const status = application.status as ApplicationStatus;

  return (
    <article className="surface-section p-6 editorial-shadow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-headline text-lg font-bold text-[var(--primary)]">
              {name}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${APPLICATION_STATUS_TONES[status] || APPLICATION_STATUS_TONES.SUBMITTED}`}
            >
              {APPLICATION_STATUS_LABELS[status] || status}
            </span>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">
            Candidature du {formatApplicationDate(application.createdAt)}
          </p>
        </div>
        <CompatibilityScore score={application.score} level={application.level} />
      </div>

      {application.matchedSkills && application.matchedSkills.length > 0 ? (
        <div className="mt-5">
          <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
            Compétences correspondantes
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {application.matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-[var(--surface-container-high)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/dashboard/recruiter/candidates/${application.applicationId}`}
          className="text-sm font-semibold text-[var(--secondary)] hover:underline"
        >
          Voir le profil
        </Link>
        <div className="ml-auto flex flex-wrap gap-2">
          {RECRUITER_STATUS_ACTIONS.map((nextStatus) => (
            <button
              key={nextStatus}
              type="button"
              disabled={updating || application.status === nextStatus}
              onClick={() =>
                onStatusChange(application.applicationId, nextStatus)
              }
              className="rounded-full bg-[var(--surface-container-highest)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] disabled:opacity-50"
            >
              {APPLICATION_STATUS_LABELS[nextStatus]}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
