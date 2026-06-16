import {
  APPLICATION_STATUS_UI,
  PIPELINE_STATUSES,
  type ApplicationStatusUi,
} from "@/lib/status/applications";
import type { ApplicationStatus } from "@/lib/types";

type StatusPipelineStripProps = {
  counts: Record<ApplicationStatus, number>;
  activeStatus: ApplicationStatus | "ALL";
  onSelect: (status: ApplicationStatus | "ALL") => void;
};

export default function StatusPipelineStrip({
  counts,
  activeStatus,
  onSelect,
}: StatusPipelineStripProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {PIPELINE_STATUSES.map((status) => {
        const config: ApplicationStatusUi = APPLICATION_STATUS_UI[status];
        const count = counts[status] ?? 0;
        const active = activeStatus === status;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? "ALL" : status)}
            className={`rounded-2xl border p-3 text-center transition ${
              active
                ? `${config.pipelineBg} border-current ${config.pipelineText} ring-1 ring-[color-mix(in_srgb,var(--secondary)_25%,transparent)]`
                : "border-[color-mix(in_srgb,var(--outline-variant)_15%,transparent)] bg-[var(--surface-container-lowest)] hover:border-[color-mix(in_srgb,var(--secondary)_25%,transparent)]"
            }`}
          >
            <p
              className={`text-xl font-bold ${active ? config.pipelineText : "text-[var(--primary)]"}`}
            >
              {count}
            </p>
            <p className="mt-0.5 text-xs text-[var(--on-surface-variant)]">
              {config.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
