"use client";

import MessageCandidateButton from "@/components/recruiter/MessageCandidateButton";
import { APPLICATION_STATUS_LABELS } from "@/lib/recruiter/candidates";
import type { ApplicationStatus } from "@/lib/types";

type CandidateDecisionPanelProps = {
  currentStatus: ApplicationStatus;
  updating: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  candidateUserId?: number | null;
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "SUBMITTED",
  "IN_REVIEW",
  "SHORTLISTED",
  "REJECTED",
];

export default function CandidateDecisionPanel({
  currentStatus,
  updating,
  onStatusChange,
  candidateUserId,
}: CandidateDecisionPanelProps) {
  return (
    <section className="surface-section p-6 editorial-shadow">
      {candidateUserId ? (
        <div className="mb-6">
          <MessageCandidateButton
            candidateUserId={candidateUserId}
            variant="block"
          />
          <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
            Ouvre une discussion directe avec ce candidat.
          </p>
        </div>
      ) : null}
      <h2 className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
        Décision
      </h2>
      <div className="mt-4 space-y-2">
        {STATUS_OPTIONS.map((nextStatus) => {
          const active = currentStatus === nextStatus;
          return (
            <button
              key={nextStatus}
              type="button"
              disabled={updating}
              onClick={() => onStatusChange(nextStatus)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition disabled:opacity-60 ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]"
              }`}
            >
              {APPLICATION_STATUS_LABELS[nextStatus]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
