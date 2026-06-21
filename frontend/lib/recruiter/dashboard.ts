import type {
  ApplicationStatus,
  DashboardApplicationItem,
  RecruiterJobSummary,
} from "@/lib/types";

export type JobStats = {
  open: number;
  draft: number;
  closed: number;
};

export type PipelineStats = {
  submitted: number;
  inReview: number;
  shortlisted: number;
  rejected: number;
};

export function computeJobStats(jobs: RecruiterJobSummary[]): JobStats {
  return jobs.reduce(
    (acc, job) => {
      const status = String(job.status);
      if (status === "OPEN") acc.open += 1;
      else if (status === "DRAFT") acc.draft += 1;
      else if (status === "CLOSED") acc.closed += 1;
      return acc;
    },
    { open: 0, draft: 0, closed: 0 },
  );
}

export function computePipelineStats(
  applications: DashboardApplicationItem[],
): PipelineStats {
  return applications.reduce(
    (acc, app) => {
      if (app.status === "SUBMITTED") acc.submitted += 1;
      else if (app.status === "IN_REVIEW") acc.inReview += 1;
      else if (app.status === "SHORTLISTED") acc.shortlisted += 1;
      else if (app.status === "REJECTED") acc.rejected += 1;
      return acc;
    },
    { submitted: 0, inReview: 0, shortlisted: 0, rejected: 0 },
  );
}

const ACTION_STATUSES: ApplicationStatus[] = ["SUBMITTED", "IN_REVIEW"];

export function getActionQueue(
  applications: DashboardApplicationItem[],
  limit = 5,
): DashboardApplicationItem[] {
  return [...applications]
    .filter((app) => ACTION_STATUSES.includes(app.status))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function getRecentJobs(
  jobs: RecruiterJobSummary[],
  limit = 4,
): RecruiterJobSummary[] {
  return [...jobs]
    .sort((a, b) => {
      const aOpen = String(a.status) === "OPEN" ? 0 : 1;
      const bOpen = String(b.status) === "OPEN" ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return b.id - a.id;
    })
    .slice(0, limit);
}

export function getOpenJobsFirst(
  jobs: RecruiterJobSummary[],
): RecruiterJobSummary[] {
  return [...jobs].sort((a, b) => {
    const aOpen = String(a.status) === "OPEN" ? 0 : 1;
    const bOpen = String(b.status) === "OPEN" ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    return a.title.localeCompare(b.title, "fr");
  });
}

export function defaultSelectedJobId(jobs: RecruiterJobSummary[]): string {
  const openJobs = getOpenJobsFirst(jobs).filter(
    (job) => String(job.status) === "OPEN",
  );
  const pick = openJobs[0] ?? getOpenJobsFirst(jobs)[0];
  return pick ? String(pick.id) : "";
}
