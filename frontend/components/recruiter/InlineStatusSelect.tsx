"use client";

import {
  APPLICATION_STATUS_LABELS,
} from "@/lib/status/applications";
import type { ApplicationStatus } from "@/lib/types";

type InlineStatusSelectProps = {
  value: ApplicationStatus;
  disabled?: boolean;
  onChange: (status: ApplicationStatus) => void;
};

const ALL_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "IN_REVIEW",
  "SHORTLISTED",
  "REJECTED",
];

export default function InlineStatusSelect({
  value,
  disabled,
  onChange,
}: InlineStatusSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label="Statut de la candidature"
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className="input-soft rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60"
    >
      {ALL_STATUSES.map((status) => (
        <option key={status} value={status}>
          {APPLICATION_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
