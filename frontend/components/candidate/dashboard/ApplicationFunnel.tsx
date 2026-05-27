import { APPLICATION_STATUS_UI, PIPELINE_STATUSES } from "@/lib/status/applications";
import type { ApplicationStatus } from "@/lib/types";

type ApplicationFunnelProps = {
  counts: Record<ApplicationStatus, number>;
};

export default function ApplicationFunnel({ counts }: ApplicationFunnelProps) {
  const total = PIPELINE_STATUSES.reduce(
    (sum, status) => sum + (counts[status] ?? 0),
    0,
  );
  if (total === 0) return null;

  return (
    <section className="surface-section p-5 editorial-shadow">
      <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
        Pipeline
      </p>
      <h2 className="mt-1 font-headline text-lg font-bold text-[var(--primary)]">
        Vos candidatures
      </h2>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[var(--surface-container-high)]">
        {PIPELINE_STATUSES.map((status) => {
          const count = counts[status] ?? 0;
          if (count === 0) return null;
          const width = `${(count / total) * 100}%`;
          const bg =
            status === "SUBMITTED"
              ? "bg-[var(--surface-container-highest)]"
              : status === "IN_REVIEW"
                ? "bg-[#001e40]"
                : status === "SHORTLISTED"
                  ? "bg-[var(--secondary)]"
                  : "bg-[#93000a]";
          return (
            <div
              key={status}
              className={`${bg} transition-all`}
              style={{ width }}
              title={`${APPLICATION_STATUS_UI[status].label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {PIPELINE_STATUSES.map((status) => (
          <span
            key={status}
            className="text-xs text-[var(--on-surface-variant)]"
          >
            {APPLICATION_STATUS_UI[status].label}:{" "}
            <strong className="text-[var(--primary)]">
              {counts[status] ?? 0}
            </strong>
          </span>
        ))}
      </div>
    </section>
  );
}
