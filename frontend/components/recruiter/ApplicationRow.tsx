"use client";

import Link from "next/link";
import InlineStatusSelect from "@/components/recruiter/InlineStatusSelect";
import { formatCandidateName } from "@/lib/recruiter/candidates";
import { formatRelativeDate } from "@/lib/status/applications";
import type { ApplicationStatus, DashboardApplicationItem } from "@/lib/types";

type ApplicationRowProps = {
  application: DashboardApplicationItem;
  updating?: boolean;
  onStatusChange: (applicationId: number, status: ApplicationStatus) => void;
};

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

export default function ApplicationRow({
  application,
  updating,
  onStatusChange,
}: ApplicationRowProps) {
  const name = formatCandidateName(
    application.candidateFirstName,
    application.candidateLastName,
  );

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] px-4 py-3 last:border-b-0 hover:bg-[var(--surface-container-low)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
        {initials(application.candidateFirstName, application.candidateLastName)}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/recruiter/candidates/${application.id}`}
          className="font-semibold text-[var(--primary)] hover:text-[var(--secondary)]"
        >
          {name}
        </Link>
        <p className="text-xs text-[var(--on-surface-variant)]">
          {application.jobTitle} · {formatRelativeDate(application.createdAt)}
        </p>
      </div>

      <InlineStatusSelect
        value={application.status}
        disabled={updating}
        onChange={(status) => onStatusChange(application.id, status)}
      />

      <Link
        href={`/dashboard/recruiter/candidates/${application.id}`}
        className="text-sm font-semibold text-[var(--secondary)] hover:underline"
      >
        →
      </Link>
    </div>
  );
}
