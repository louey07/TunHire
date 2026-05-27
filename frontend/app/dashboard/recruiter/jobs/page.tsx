"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatchQuery } from "@/lib/api";
import { useCompanyDashboard } from "@/lib/hooks/useCompanyDashboard";
import {
  RecruiterSetupNotice,
  useRequireActiveCompany,
} from "@/lib/hooks/useRequireActiveCompany";
import { computeJobStats } from "@/lib/recruiter/dashboard";
import RecruiterJobCard from "@/components/recruiter/RecruiterJobCard";
import StatusFilterPills from "@/components/ui/StatusFilterPills";
import EmptyStatePanel from "@/components/ui/EmptyStatePanel";
import { JOB_STATUS_FILTERS, type JobStatusFilter } from "@/lib/status/jobs";
import type { JobStatus, RecruiterJobSummary } from "@/lib/types";

export default function RecruiterJobsPage() {
  const { activeCompany, loading: companyLoading } = useRequireActiveCompany();
  const { dashboard, loading: dashboardLoading } = useCompanyDashboard(
    activeCompany?.companyId,
  );
  const [jobs, setJobs] = useState<RecruiterJobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionJobId, setActionJobId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>("ALL");

  const loadJobs = useCallback(async () => {
    if (!activeCompany) return;
    setLoading(true);
    setError("");
    const res = await apiGet<RecruiterJobSummary[]>(
      `/companies/${activeCompany.companyId}/jobs`,
    );
    if (!res.success) {
      setError(res.message || "Impossible de charger les offres.");
      setJobs([]);
    } else {
      setJobs(res.data || []);
    }
    setLoading(false);
  }, [activeCompany]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const applicantCountByJob = useMemo(() => {
    const map: Record<number, number> = {};
    (dashboard?.applications ?? []).forEach((app) => {
      map[app.jobId] = (map[app.jobId] ?? 0) + 1;
    });
    return map;
  }, [dashboard?.applications]);

  const jobStats = useMemo(() => computeJobStats(jobs), [jobs]);

  const filterOptions = useMemo(
    () =>
      JOB_STATUS_FILTERS.map((filter) => ({
        ...filter,
        count:
          filter.value === "ALL"
            ? jobs.length
            : filter.value === "OPEN"
              ? jobStats.open
              : filter.value === "DRAFT"
                ? jobStats.draft
                : jobStats.closed,
      })),
    [jobStats, jobs.length],
  );

  const filteredJobs = useMemo(() => {
    if (statusFilter === "ALL") return jobs;
    return jobs.filter((job) => String(job.status) === statusFilter);
  }, [jobs, statusFilter]);

  async function updateStatus(jobId: number, status: JobStatus) {
    setActionJobId(jobId);
    const res = await apiPatchQuery(`/jobs/${jobId}/status`, { status });
    if (res.success) {
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status } : job)),
      );
    } else {
      setError(res.message || "Impossible de mettre à jour le statut.");
    }
    setActionJobId(null);
  }

  async function deleteJob(jobId: number, title: string) {
    if (!confirm(`Supprimer l'offre « ${title} » ?`)) return;
    setActionJobId(jobId);
    const res = await apiDelete(`/jobs/${jobId}`);
    if (res.success) {
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } else {
      setError(res.message || "Impossible de supprimer l'offre.");
    }
    setActionJobId(null);
  }

  if (companyLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="surface-card h-40 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!activeCompany) {
    return <RecruiterSetupNotice />;
  }

  const pageLoading = loading || dashboardLoading;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
            Offres
          </p>
          <h1 className="font-headline text-4xl font-extrabold text-[var(--primary)]">
            Gérer les offres
          </h1>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            {activeCompany.companyName}
          </p>
        </div>
        <Link
          href="/dashboard/recruiter/jobs/new"
          className="btn-primary rounded-full px-6 py-3 text-sm"
        >
          Créer une offre
        </Link>
      </div>

      {error ? <p className="mb-4 text-sm text-[#93000a]">{error}</p> : null}

      {jobs.length > 0 ? (
        <div className="mb-6">
          <StatusFilterPills
            options={filterOptions}
            activeValue={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      ) : null}

      {pageLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="surface-card h-52 animate-pulse rounded-3xl"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyStatePanel
          title="Aucune offre pour le moment"
          description="Créez votre première offre pour commencer à recruter."
          action={
            <Link
              href="/dashboard/recruiter/jobs/new"
              className="btn-primary rounded-full px-6 py-3 text-sm"
            >
              Créer une offre
            </Link>
          }
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyStatePanel
          title={`Aucune offre ${statusFilter === "ALL" ? "" : statusFilter.toLowerCase()}`}
          description="Essayez un autre filtre."
          action={
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className="btn-secondary rounded-full px-5 py-2 text-sm"
            >
              Voir toutes
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 overflow-visible md:grid-cols-2">
          {filteredJobs.map((job) => (
            <RecruiterJobCard
              key={job.id}
              job={job}
              applicantCount={applicantCountByJob[job.id] ?? 0}
              busy={actionJobId === job.id}
              onPublish={() => void updateStatus(job.id, "OPEN")}
              onClose={() => void updateStatus(job.id, "CLOSED")}
              onReopen={() => void updateStatus(job.id, "OPEN")}
              onDelete={() => void deleteJob(job.id, job.title)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
