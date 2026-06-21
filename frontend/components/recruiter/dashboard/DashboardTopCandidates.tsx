"use client";

import Link from "next/link";
import {
  formatCandidateName,
  scoreLevelLabel,
} from "@/lib/recruiter/candidates";
import type { EnrichedRankedApplication, RecruiterJobSummary } from "@/lib/types";

type DashboardTopCandidatesProps = {
  jobs: RecruiterJobSummary[];
  selectedJobId: string;
  onJobChange: (jobId: string) => void;
  candidates: EnrichedRankedApplication[];
  loading: boolean;
};

export default function DashboardTopCandidates({
  jobs,
  selectedJobId,
  onJobChange,
  candidates,
  loading,
}: DashboardTopCandidatesProps) {
  const topThree = candidates.slice(0, 3);
  const activeJob = jobs.find((job) => String(job.id) === selectedJobId);

  return (
    <section
      className="rounded-3xl p-6 text-white editorial-shadow"
      style={{
        background:
          "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)",
      }}
    >
      <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary-bright)]">
        Classement IA
      </p>
      <h2 className="mt-2 font-headline text-2xl font-bold">
        Meilleurs profils
      </h2>
      <p className="mt-2 text-sm text-white/70">
        {activeJob ? `Pour ${activeJob.title}` : "Sélectionnez une offre."}
      </p>

      {jobs.length > 0 ? (
        <select
          value={selectedJobId}
          onChange={(e) => onJobChange(e.target.value)}
          className="mt-4 w-full rounded-2xl bg-white/10 px-4 py-2 text-sm text-white"
        >
          <option value="">Choisir une offre</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-white/70">Chargement…</p>
      ) : topThree.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {topThree.map((candidate) => (
            <li
              key={candidate.applicationId}
              className="rounded-2xl bg-white/10 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/recruiter/candidates/${candidate.applicationId}`}
                    className="font-semibold hover:underline"
                  >
                    {formatCandidateName(
                      candidate.candidateFirstName,
                      candidate.candidateLastName,
                    )}
                  </Link>
                  {candidate.level ? (
                    <p className="mt-1 text-xs text-white/70">
                      {scoreLevelLabel(candidate.level)}
                    </p>
                  ) : null}
                </div>
                {candidate.score != null ? (
                  <p className="font-headline text-xl font-extrabold text-[var(--tertiary)]">
                    {candidate.score}%
                  </p>
                ) : (
                  <p className="text-xs text-white/60">Score N/A</p>
                )}
              </div>
              {candidate.matchedSkills && candidate.matchedSkills.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.matchedSkills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/70">
          Aucun candidat classé pour cette offre.
        </p>
      )}

      {selectedJobId ? (
        <Link
          href={`/dashboard/recruiter/candidates?jobId=${selectedJobId}`}
          className="mt-5 inline-block text-sm font-semibold text-[var(--secondary-bright)] hover:underline"
        >
          Voir tous les candidats →
        </Link>
      ) : null}
    </section>
  );
}
