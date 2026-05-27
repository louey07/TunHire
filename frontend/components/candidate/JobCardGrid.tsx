import type { ReactNode } from "react";
import CandidateJobCard from "@/components/candidate/JobCard";
import EmptyStatePanel from "@/components/ui/EmptyStatePanel";
import type { Job } from "@/lib/types";

type JobCardGridProps = {
  jobs: Job[];
  selectedId?: number | null;
  appliedJobIds?: number[];
  onSelect?: (jobId: number) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  large?: boolean;
};

export default function JobCardGrid({
  jobs,
  selectedId,
  appliedJobIds = [],
  onSelect,
  loading,
  emptyTitle = "Aucune offre trouvée",
  emptyDescription = "Modifiez vos critères de recherche.",
  emptyAction,
  large = false,
}: JobCardGridProps) {
  if (loading) {
    return (
      <div className={`grid gap-4 ${large ? "p-5 sm:p-6" : "p-4"} grid-cols-1`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`surface-card animate-pulse rounded-3xl ${
              large ? "h-56 sm:h-64" : "h-44"
            }`}
          />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-6">
        <EmptyStatePanel
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-4 ${large ? "p-5 sm:p-6" : "p-4"}`}>
      {jobs.map((job) => (
        <CandidateJobCard
          key={job.id}
          job={job}
          selected={selectedId === job.id}
          onSelect={onSelect ? () => onSelect(job.id) : undefined}
          alreadyApplied={appliedJobIds.includes(job.id)}
          large={large}
        />
      ))}
    </div>
  );
}
