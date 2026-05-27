"use client";

import Link from "next/link";
import MessageCandidateButton from "@/components/recruiter/MessageCandidateButton";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  formatApplicationDate,
  scoreLevelLabel,
} from "@/lib/recruiter/candidates";
import type { ApplicationStatus } from "@/lib/types";

type CandidateReviewHeaderProps = {
  displayName: string;
  status: ApplicationStatus;
  appliedAt: string;
  jobTitle?: string | null;
  score: number | null;
  level: string | null;
  candidateUserId?: number | null;
};

export default function CandidateReviewHeader({
  displayName,
  status,
  appliedAt,
  jobTitle,
  score,
  level,
  candidateUserId,
}: CandidateReviewHeaderProps) {
  return (
    <section className="-mx-4 border-y border-[color-mix(in_srgb,var(--outline-variant)_15%,transparent)] bg-[var(--surface-container-lowest)] px-4 py-6 shadow-[0_2px_12px_rgba(0,30,64,0.06)] lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
      <Link
        href="/dashboard/recruiter/candidates"
        className="text-sm font-semibold text-[var(--secondary)]"
      >
        ← Retour aux candidats
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
            Revue de candidature
          </p>
          <h1 className="mt-2 font-headline text-3xl font-extrabold text-[var(--primary)] xl:text-4xl">
            {displayName}
          </h1>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            Candidature du {formatApplicationDate(appliedAt)}
            {jobTitle ? ` · ${jobTitle}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {candidateUserId ? (
            <MessageCandidateButton candidateUserId={candidateUserId} />
          ) : null}
          <span
            className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] ${APPLICATION_STATUS_TONES[status] || APPLICATION_STATUS_TONES.SUBMITTED}`}
          >
            {APPLICATION_STATUS_LABELS[status] || status}
          </span>

          {score != null ? (
            <div
              className="rounded-2xl px-5 py-3 text-white editorial-shadow"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)",
              }}
            >
              <p className="label-uppercase text-[10px] font-semibold text-white/70">
                Compatibilité IA
              </p>
              <p className="font-headline text-2xl font-extrabold">{score}%</p>
              {level ? (
                <p className="mt-1 text-xs text-white/80">
                  {scoreLevelLabel(level)}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
