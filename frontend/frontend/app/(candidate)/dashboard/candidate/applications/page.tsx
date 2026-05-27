"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ApplicationCard from "@/components/candidate/ApplicationCard";
import CandidateContent from "@/components/CandidateContent";
import CandidatePageHeader from "@/components/CandidatePageHeader";
import ErrorBlock from "@/components/ErrorBlock";
import EmptyStatePanel from "@/components/ui/EmptyStatePanel";
import StatusFilterPills from "@/components/ui/StatusFilterPills";
import StatusPipelineStrip from "@/components/ui/StatusPipelineStrip";
import { getUser, requireRole } from "@/lib/auth";
import { useCandidateApplications } from "@/lib/hooks/useCandidateApplications";
import {
  APPLICATION_STATUS_UI,
  PIPELINE_STATUSES,
  filterApplicationsByStatus,
} from "@/lib/status/applications";
import type { ApplicationStatus } from "@/lib/types";

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const user = getUser();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );

  useEffect(() => {
    requireRole("CANDIDATE", router);
  }, [router]);

  const { applications, jobsById, statusCounts, loading, error, deletingId, deleteApplication } =
    useCandidateApplications(user?.id);

  async function handleDeleteApplication(applicationId: number) {
    const job = applications.find((app) => app.id === applicationId);
    const jobTitle = job?.jobId ? jobsById[job.jobId]?.title : undefined;
    const confirmed = window.confirm(
      jobTitle
        ? `Retirer votre candidature pour « ${jobTitle} » ?`
        : "Retirer cette candidature ?",
    );
    if (!confirmed) return;
    await deleteApplication(applicationId);
  }

  const filteredApplications = useMemo(() => {
    const byStatus = filterApplicationsByStatus(applications, statusFilter);
    const term = query.trim().toLowerCase();
    if (!term) return byStatus;
    return byStatus.filter((app) => {
      const job = app.jobId ? jobsById[app.jobId] : undefined;
      const title = job?.title ?? "Poste confidentiel";
      const company = job?.companyName ?? "";
      return (
        title.toLowerCase().includes(term) ||
        company.toLowerCase().includes(term)
      );
    });
  }, [applications, jobsById, query, statusFilter]);

  const filterPillOptions = useMemo(
    () => [
      { label: "Toutes", value: "ALL" as const, count: applications.length },
      ...PIPELINE_STATUSES.map((status) => ({
        label: APPLICATION_STATUS_UI[status].label,
        value: status,
        count: statusCounts[status],
      })),
    ],
    [applications.length, statusCounts],
  );

  return (
    <CandidateContent>
      <CandidatePageHeader
        eyebrow="Candidatures"
        title="Mes candidatures"
        subtitle="Suivez l'état de vos candidatures et retrouvez vos prochaines opportunités."
        meta={
          applications.length > 0 ? (
            <span>
              <strong className="text-[var(--primary)]">
                {applications.length}
              </strong>{" "}
              candidature{applications.length !== 1 ? "s" : ""} au total
            </span>
          ) : undefined
        }
        actions={
          <Link
            href="/jobs"
            className="btn-primary rounded-full px-5 py-3 text-xs font-bold"
          >
            Nouvelle recherche
          </Link>
        }
      />

      {applications.length > 0 ? (
        <div className="mt-8 space-y-5">
          <StatusPipelineStrip
            counts={statusCounts}
            activeStatus={statusFilter}
            onSelect={setStatusFilter}
          />
          <StatusFilterPills
            options={filterPillOptions}
            activeValue={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      ) : null}

      <div className="mt-8 flex w-full max-w-lg items-center gap-3 rounded-full bg-[var(--surface-container-lowest)] px-4 py-2 soft-outline">
        <span className="text-[var(--on-surface-variant)]">⌕</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une candidature…"
          className="w-full bg-transparent text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
        />
      </div>

      <section className="mt-8 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="surface-card h-36 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : error ? (
          <ErrorBlock message={error} />
        ) : filteredApplications.length === 0 ? (
          <EmptyStatePanel
            title={
              applications.length === 0
                ? "Aucune candidature"
                : "Aucun résultat"
            }
            description={
              applications.length === 0
                ? "Parcourez les offres et postulez pour voir vos candidatures ici."
                : "Modifiez vos filtres ou votre recherche."
            }
            action={
              applications.length === 0 ? (
                <Link
                  href="/jobs"
                  className="btn-primary rounded-full px-5 py-2 text-sm"
                >
                  Trouver un emploi
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setQuery("");
                  }}
                  className="btn-secondary rounded-full px-5 py-2 text-sm"
                >
                  Effacer les filtres
                </button>
              )
            }
          />
        ) : (
          filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              job={app.jobId ? jobsById[app.jobId] : undefined}
              onDelete={handleDeleteApplication}
              deleting={deletingId === app.id}
            />
          ))
        )}
      </section>
    </CandidateContent>
  );
}
