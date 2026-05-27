"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ApplicationRow from "@/components/recruiter/ApplicationRow";
import CandidateCard from "@/components/recruiter/CandidateCard";
import EmptyStatePanel from "@/components/ui/EmptyStatePanel";
import StatusPipelineStrip from "@/components/ui/StatusPipelineStrip";
import { apiGet, apiPatchQuery } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { useCompanyDashboard } from "@/lib/hooks/useCompanyDashboard";
import { useRankedApplications } from "@/lib/hooks/useRankedApplications";
import {
  RecruiterSetupNotice,
  useRequireActiveCompany,
} from "@/lib/hooks/useRequireActiveCompany";
import { computePipelineStats } from "@/lib/recruiter/dashboard";
import { formatCandidateName } from "@/lib/recruiter/candidates";
import {
  countByStatus,
  filterApplicationsByStatus,
} from "@/lib/status/applications";
import type { ApplicationStatus, RecruiterJobSummary } from "@/lib/types";

type TabId = "applications" | "ranking";

export default function RecruiterCandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="surface-card h-40 animate-pulse rounded-3xl" />
        </div>
      }
    >
      <RecruiterCandidatesPageContent />
    </Suspense>
  );
}

function RecruiterCandidatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferredJobId = searchParams.get("jobId");
  const initialTab =
    searchParams.get("tab") === "ranking" ? "ranking" : "applications";

  const { activeCompany, loading: companyLoading } = useRequireActiveCompany();
  const { dashboard, loading: dashboardLoading, refresh } = useCompanyDashboard(
    activeCompany?.companyId,
  );

  const [tab, setTab] = useState<TabId>(initialTab);
  const [jobs, setJobs] = useState<RecruiterJobSummary[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [appsMessage, setAppsMessage] = useState("");

  const {
    applications: rankedApplications,
    loading: rankedLoading,
    message: rankedMessage,
    updatingId: rankedUpdatingId,
    loadRanked,
    updateStatus: updateRankedStatus,
  } = useRankedApplications(
    tab === "ranking" && selectedJobId !== "ALL" ? selectedJobId : "",
  );

  useEffect(() => {
    requireRole("RECRUITER", router);
  }, [router]);

  useEffect(() => {
    if (!activeCompany) {
      setJobs([]);
      return;
    }
    void (async () => {
      const res = await apiGet<RecruiterJobSummary[]>(
        `/companies/${activeCompany.companyId}/jobs`,
      );
      if (res.success) {
        const list = res.data || [];
        setJobs(list);
        if (preferredJobId && list.some((j) => String(j.id) === preferredJobId)) {
          setSelectedJobId(preferredJobId);
        }
      }
    })();
  }, [activeCompany, preferredJobId]);

  useEffect(() => {
    if (tab === "ranking" && selectedJobId && selectedJobId !== "ALL") {
      void loadRanked();
    }
  }, [tab, selectedJobId, loadRanked]);

  const allApplications = dashboard?.applications ?? [];
  const pipelineStats = useMemo(
    () => computePipelineStats(allApplications),
    [allApplications],
  );
  const statusCounts = useMemo(
    () => countByStatus(allApplications),
    [allApplications],
  );

  const filteredApplications = useMemo(() => {
    let list = filterApplicationsByStatus(allApplications, statusFilter);
    if (selectedJobId !== "ALL") {
      list = list.filter((app) => String(app.jobId) === selectedJobId);
    }
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((app) => {
      const name = formatCandidateName(
        app.candidateFirstName,
        app.candidateLastName,
      ).toLowerCase();
      return (
        name.includes(term) ||
        app.jobTitle.toLowerCase().includes(term)
      );
    });
  }, [allApplications, statusFilter, selectedJobId, search]);

  const selectedJob = jobs.find((job) => String(job.id) === selectedJobId);
  const canShowRanking =
    selectedJobId !== "ALL" && filteredApplications.length > 0;

  async function updateApplicationStatus(
    applicationId: number,
    status: ApplicationStatus,
  ) {
    setUpdatingId(applicationId);
    setAppsMessage("");
    const res = await apiPatchQuery(`/applications/${applicationId}/status`, {
      status,
    });
    if (!res.success) {
      setAppsMessage(res.message || "Impossible de mettre à jour le statut.");
    } else {
      await refresh();
    }
    setUpdatingId(null);
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

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 space-y-3">
        <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
          Candidatures
        </p>
        <h1 className="font-headline text-4xl font-extrabold text-[var(--primary)]">
          Candidats
        </h1>
        <p className="max-w-2xl text-sm text-[var(--on-surface-variant)]">
          Gérez toutes les candidatures reçues ou consultez le classement IA par
          offre.
        </p>
      </header>

      <div className="mb-6 flex gap-2 border-b border-[color-mix(in_srgb,var(--outline-variant)_15%,transparent)]">
        <button
          type="button"
          onClick={() => setTab("applications")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
            tab === "applications"
              ? "border-[var(--secondary)] text-[var(--primary)]"
              : "border-transparent text-[var(--on-surface-variant)]"
          }`}
        >
          Candidatures
        </button>
        <button
          type="button"
          onClick={() => setTab("ranking")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
            tab === "ranking"
              ? "border-[var(--secondary)] text-[var(--primary)]"
              : "border-transparent text-[var(--on-surface-variant)]"
          }`}
        >
          Classement IA
        </button>
      </div>

      {tab === "applications" ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--on-surface-variant)]">
              <strong className="text-[var(--primary)]">
                {allApplications.length}
              </strong>{" "}
              candidature{allApplications.length !== 1 ? "s" : ""}
            </p>
            {canShowRanking ? (
              <Link
                href={`/dashboard/recruiter/candidates?jobId=${selectedJobId}&tab=ranking`}
                className="btn-primary rounded-full px-4 py-2 text-xs font-bold"
              >
                Classement IA
              </Link>
            ) : null}
          </div>

          {allApplications.length > 0 ? (
            <div className="mb-6 space-y-5">
              <StatusPipelineStrip
                counts={statusCounts}
                activeStatus={statusFilter}
                onSelect={setStatusFilter}
              />
            </div>
          ) : null}

          <div className="mb-5 flex flex-wrap gap-3">
            <select
              className="input-soft w-52 rounded-xl px-3 py-2 text-sm"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="ALL">Toutes les offres</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un candidat…"
              className="input-soft min-w-[200px] flex-1 rounded-xl px-4 py-2 text-sm"
            />
            {(selectedJobId !== "ALL" || statusFilter !== "ALL" || search) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedJobId("ALL");
                  setStatusFilter("ALL");
                  setSearch("");
                }}
                className="text-xs font-semibold text-[var(--secondary)] hover:underline"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {canShowRanking ? (
            <div className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--secondary)_25%,transparent)] bg-[color-mix(in_srgb,var(--secondary)_6%,white)] px-4 py-3 text-sm">
              <span className="font-semibold text-[var(--primary)]">
                Classement IA disponible
              </span>
              <span className="ml-2 text-[var(--on-surface-variant)]">
                pour {selectedJob?.title}
              </span>
              <Link
                href={`/dashboard/recruiter/candidates?jobId=${selectedJobId}&tab=ranking`}
                className="ml-3 text-xs font-bold text-[var(--secondary)] hover:underline"
              >
                Voir le classement →
              </Link>
            </div>
          ) : null}

          {appsMessage ? (
            <p className="mb-4 text-sm text-[#93000a]">{appsMessage}</p>
          ) : null}

          {dashboardLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="surface-card h-16 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : allApplications.length === 0 ? (
            <EmptyStatePanel
              title="Aucune candidature"
              description="Les candidatures apparaîtront ici dès qu'un candidat postule."
            />
          ) : filteredApplications.length === 0 ? (
            <EmptyStatePanel
              title="Aucun résultat"
              description="Modifiez vos filtres ou votre recherche."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJobId("ALL");
                    setStatusFilter("ALL");
                    setSearch("");
                  }}
                  className="btn-secondary rounded-full px-5 py-2 text-sm"
                >
                  Effacer les filtres
                </button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-lowest)]">
              {filteredApplications.map((app) => (
                <ApplicationRow
                  key={app.id}
                  application={app}
                  updating={updatingId === app.id}
                  onStatusChange={updateApplicationStatus}
                />
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-[var(--on-surface-variant)]">
            Pipeline : {pipelineStats.submitted} soumises ·{" "}
            {pipelineStats.inReview} en examen · {pipelineStats.shortlisted}{" "}
            présélectionnées
          </p>
        </>
      ) : (
        <>
          <section className="surface-section mb-6 p-6 editorial-shadow">
            <label
              htmlFor="job-select-ranking"
              className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]"
            >
              Offre à analyser
            </label>
            <select
              id="job-select-ranking"
              className="input-soft mt-3 w-full rounded-2xl px-4 py-3 text-sm"
              value={selectedJobId === "ALL" ? "" : selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value || "ALL")}
            >
              <option value="">Sélectionner une offre</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} · {job.status}
                </option>
              ))}
            </select>
          </section>

          {rankedMessage ? (
            <p className="mb-4 text-sm text-[#93000a]">{rankedMessage}</p>
          ) : null}

          <div className="space-y-4">
            {rankedLoading ? (
              <>
                <div className="surface-card h-36 animate-pulse rounded-3xl" />
                <div className="surface-card h-36 animate-pulse rounded-3xl" />
              </>
            ) : !selectedJobId || selectedJobId === "ALL" ? (
              <EmptyStatePanel
                title="Sélectionnez une offre"
                description="Choisissez une offre pour afficher le classement IA des candidats."
              />
            ) : rankedApplications.length === 0 ? (
              <EmptyStatePanel
                title="Aucune candidature"
                description={`Les candidats classés apparaîtront ici pour ${selectedJob?.title || "cette offre"}.`}
              />
            ) : (
              rankedApplications.map((application) => (
                <CandidateCard
                  key={application.applicationId}
                  application={application}
                  updating={rankedUpdatingId === application.applicationId}
                  onStatusChange={updateRankedStatus}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
