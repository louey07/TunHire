"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DashboardActionQueue from "@/components/recruiter/dashboard/DashboardActionQueue";
import DashboardKpiCards from "@/components/recruiter/dashboard/DashboardKpiCards";
import DashboardRecentJobs from "@/components/recruiter/dashboard/DashboardRecentJobs";
import DashboardTopCandidates from "@/components/recruiter/dashboard/DashboardTopCandidates";
import CompanyOnboarding from "@/components/recruiter/CompanyOnboarding";
import CompanyPicker from "@/components/recruiter/CompanyPicker";
import { roleLabel } from "@/components/recruiter/CompanyPicker";
import { useRecruiterCompany } from "@/lib/context/RecruiterCompanyContext";
import { requireRole } from "@/lib/auth";
import { useCompanyDashboard } from "@/lib/hooks/useCompanyDashboard";
import { useRankedApplications } from "@/lib/hooks/useRankedApplications";
import {
  computeJobStats,
  computePipelineStats,
  defaultSelectedJobId,
  getActionQueue,
  getOpenJobsFirst,
  getRecentJobs,
} from "@/lib/recruiter/dashboard";
import type { MembershipResponse } from "@/lib/types";

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const {
    companies,
    activeCompany,
    loading: companyLoading,
    error: companyError,
    selectCompany,
    clearActiveCompany,
    refresh,
  } = useRecruiterCompany();

  const {
    dashboard,
    loading: dashboardLoading,
    error: dashboardError,
  } = useCompanyDashboard(activeCompany?.companyId);

  const [selectedJobId, setSelectedJobId] = useState("");
  const {
    applications: rankedApplications,
    loading: loadingApps,
    loadRanked,
  } = useRankedApplications(selectedJobId);

  useEffect(() => {
    requireRole("RECRUITER", router);
  }, [router]);

  const sortedJobs = useMemo(
    () => getOpenJobsFirst(dashboard?.jobs ?? []),
    [dashboard?.jobs],
  );

  useEffect(() => {
    if (!dashboard?.jobs.length) {
      setSelectedJobId("");
      return;
    }
    setSelectedJobId((current) => {
      if (current && dashboard.jobs.some((job) => String(job.id) === current)) {
        return current;
      }
      return defaultSelectedJobId(dashboard.jobs);
    });
  }, [dashboard?.jobs]);

  useEffect(() => {
    if (selectedJobId) void loadRanked();
  }, [selectedJobId, loadRanked]);

  const jobStats = useMemo(
    () => computeJobStats(dashboard?.jobs ?? []),
    [dashboard?.jobs],
  );
  const pipelineStats = useMemo(
    () => computePipelineStats(dashboard?.applications ?? []),
    [dashboard?.applications],
  );
  const actionQueue = useMemo(
    () => getActionQueue(dashboard?.applications ?? []),
    [dashboard?.applications],
  );
  const recentJobs = useMemo(
    () => getRecentJobs(dashboard?.jobs ?? []),
    [dashboard?.jobs],
  );

  async function handleJoined(membership: MembershipResponse) {
    await refresh();
    selectCompany(membership.companyId);
  }

  const loading = companyLoading || dashboardLoading;
  const error = companyError || dashboardError;

  return (
    <div className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
              Espace recruteur
            </p>
            <h1 className="font-headline text-4xl font-extrabold text-[var(--primary)] lg:text-5xl">
              Tableau de bord
            </h1>
            <p className="max-w-xl text-sm text-[var(--on-surface-variant)]">
              Gérez vos offres, suivez les candidatures et pilotez votre
              pipeline de recrutement.
            </p>
          </div>
          {activeCompany ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/recruiter/jobs/new"
                className="btn-primary rounded-full px-5 py-3 text-sm"
              >
                Publier une offre
              </Link>
              <Link
                href="/dashboard/recruiter/jobs"
                className="btn-secondary rounded-full px-5 py-3 text-sm"
              >
                Gérer les offres
              </Link>
            </div>
          ) : null}
        </header>

        {loading ? (
          <div className="mt-10 space-y-4">
            <div className="surface-card h-32 animate-pulse rounded-3xl" />
            <div className="surface-card h-48 animate-pulse rounded-3xl" />
            <div className="surface-card h-48 animate-pulse rounded-3xl" />
          </div>
        ) : error ? (
          <p className="mt-10 text-sm text-[#93000a]">{error}</p>
        ) : !activeCompany ? (
          <div className="mt-10 space-y-8">
            {companies.length > 0 ? (
              <section className="surface-section p-6 editorial-shadow">
                <h2 className="font-headline text-2xl font-bold text-[var(--primary)]">
                  Choisir une entreprise
                </h2>
                <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                  Vous appartenez à {companies.length} entreprise
                  {companies.length > 1 ? "s" : ""}. Sélectionnez celle à
                  utiliser.
                </p>
                <div className="mt-6">
                  <CompanyPicker companies={companies} onSelect={selectCompany} />
                </div>
              </section>
            ) : null}
            <section className="surface-section p-6 editorial-shadow">
              <h2 className="font-headline text-2xl font-bold text-[var(--primary)]">
                {companies.length > 0
                  ? "Ajouter une entreprise"
                  : "Commencer"}
              </h2>
              <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                Créez votre structure ou rejoignez une équipe via invitation.
              </p>
              <div className="mt-6">
                <CompanyOnboarding
                  onCreated={refresh}
                  onJoined={handleJoined}
                />
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            <div
              className="rounded-3xl p-6 text-white editorial-shadow"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="label-uppercase text-[10px] font-semibold text-white/70">
                    Entreprise active
                  </p>
                  <h2 className="font-headline text-2xl font-bold">
                    {activeCompany.companyName}
                  </h2>
                  <p className="mt-2 text-sm text-white/70">
                    {activeCompany.location || "Localisation non renseignée"}
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--secondary-bright)]">
                    {roleLabel(activeCompany.role)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearActiveCompany}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                >
                  Changer
                </button>
              </div>
            </div>

            {!dashboard?.jobs.length ? (
              <div className="surface-section p-10 text-center editorial-shadow">
                <p className="font-headline text-xl font-bold text-[var(--primary)]">
                  Publiez votre première offre
                </p>
                <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                  Créez une offre pour commencer à recevoir des candidatures.
                </p>
                <Link
                  href="/dashboard/recruiter/jobs/new"
                  className="btn-primary mt-6 inline-block rounded-full px-6 py-3 text-sm"
                >
                  Publier une offre
                </Link>
              </div>
            ) : (
              <>
                <DashboardKpiCards
                  jobStats={jobStats}
                  pipelineStats={pipelineStats}
                />

                <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                  <DashboardActionQueue items={actionQueue} />
                  <DashboardTopCandidates
                    jobs={sortedJobs}
                    selectedJobId={selectedJobId}
                    onJobChange={setSelectedJobId}
                    candidates={rankedApplications}
                    loading={loadingApps}
                  />
                </div>

                <DashboardRecentJobs jobs={recentJobs} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
