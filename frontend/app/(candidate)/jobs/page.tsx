"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CandidateContent from "@/components/CandidateContent";
import EmptyState from "@/components/EmptyState";
import ErrorBlock from "@/components/ErrorBlock";
import FilterBar from "@/components/candidate/FilterBar";
import JobCardGrid from "@/components/candidate/JobCardGrid";
import JobSearchFilters from "@/components/candidate/JobSearchFilters";
import JobCompanySummary from "@/components/candidate/JobCompanySummary";
import { apiGet, apiPost, apiPublicGet } from "@/lib/api";
import { useClientUser } from "@/lib/hooks/useClientUser";
import {
  applyJobSearchFilters,
  buildFilterOptions,
  countActiveFilters,
  emptyJobSearchFilters,
  formatSalaryRange,
} from "@/lib/candidate/jobSearch";
import {
  JOB_META,
  JobContractBadge,
  JobExperienceBadge,
  JobLocationLine,
  JobSalaryLine,
  JobWorkModeBadge,
} from "@/lib/candidate/jobMeta";
import type { Job, PaginatedResponse } from "@/lib/types";

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useClientUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [filters, setFilters] = useState(emptyJobSearchFilters);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [applyMsg, setApplyMsg] = useState("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  async function fetchJobs(p: number) {
    setLoading(true);
    setError("");
    try {
      const res = await apiPublicGet<PaginatedResponse<Job>>(
        `/jobs?page=${p}&size=50`,
      );
      if (!res.success) {
        setError("Impossible de charger les offres pour le moment.");
        setJobs([]);
        return;
      }
      const pageData = res.data || {};
      setJobs(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setPage(pageData.number ?? p);
    } catch {
      setError("Erreur de connexion lors du chargement des offres.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications(userId: number) {
    try {
      const res = await apiGet<{ jobId?: number }[]>(
        `/applications?userId=${userId}`,
      );
      if (!res.success) return;
      const jobIds = (res.data || [])
        .map((item) => item.jobId)
        .filter((jobId): jobId is number => typeof jobId === "number");
      setAppliedJobIds(jobIds);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const q = searchParams.get("q");
    const location = searchParams.get("location");
    if (q) setKeyword(q);
    if (location) setLocationQuery(location);
  }, [searchParams]);

  useEffect(() => {
    void fetchJobs(0);
    if (user?.role === "CANDIDATE") void loadApplications(user.id);
  }, [user]);

  const filterOptions = useMemo(() => buildFilterOptions(jobs), [jobs]);

  const filtered = useMemo(
    () => applyJobSearchFilters(jobs, keyword, locationQuery, filters),
    [jobs, keyword, locationQuery, filters],
  );

  const selectedJob = useMemo(() => {
    if (!filtered.length) return null;
    return filtered.find((job) => job.id === selectedId) ?? filtered[0];
  }, [filtered, selectedId]);

  const activeFilterCount = countActiveFilters(filters);
  const salaryLabel = selectedJob
    ? formatSalaryRange(selectedJob.salaryMin, selectedJob.salaryMax)
    : null;

  async function applyToJob(jobId: number) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "CANDIDATE") {
      setApplyMsg("Seuls les candidats peuvent postuler à une offre.");
      return;
    }
    if (appliedJobIds.includes(jobId)) {
      setApplyMsg("Vous avez déjà postulé à cette offre.");
      return;
    }

    setApplyingJobId(jobId);
    setApplyMsg("");
    try {
      const res = await apiPost("/applications", { jobId });
      if (res.success) {
        setAppliedJobIds((prev) => [...prev, jobId]);
        setApplyMsg("Votre candidature a été envoyée avec succès.");
      } else {
        setApplyMsg(res.message || "Impossible d'envoyer la candidature.");
      }
    } catch {
      setApplyMsg("Erreur de connexion pendant la candidature.");
    } finally {
      setApplyingJobId(null);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSelectedId(null);
  }

  return (
    <CandidateContent wide>
      <div className="flex min-h-[calc(100vh-5rem)] flex-col">
        <section className="-mx-4 rounded-none border-y border-[color-mix(in_srgb,var(--outline-variant)_15%,transparent)] bg-[var(--surface-container-lowest)] px-4 py-6 shadow-[0_2px_12px_rgba(0,30,64,0.06)] lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
          <div className="mb-5">
            <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
              Recherche d&apos;emploi
            </p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold text-[var(--primary)] xl:text-4xl">
              Trouver votre prochaine opportunité
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--on-surface-variant)]">
              Parcourez les offres publiées, affinez avec les filtres et
              postulez directement depuis cette page.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto]"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--on-surface-variant)]">
                🔎 Métier, compétence ou entreprise
              </span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ex. développeur, marketing, data…"
                className="input-soft w-full rounded-xl px-5 py-3.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--on-surface-variant)]">
                📍 Ville ou région
              </span>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Ex. Tunis, Sfax, Sousse…"
                className="input-soft w-full rounded-xl px-5 py-3.5 text-sm"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="btn-primary w-full rounded-xl px-8 py-3.5 text-sm lg:min-w-[140px]"
              >
                Rechercher
              </button>
            </div>
          </form>
        </section>

        <div className="mt-5 space-y-4">
          <JobSearchFilters
            layout="horizontal"
            filters={filters}
            options={filterOptions}
            activeCount={activeFilterCount}
            onChange={setFilters}
            onClear={() => setFilters(emptyJobSearchFilters)}
          />
          <FilterBar
            filters={filters}
            resultCount={filtered.length}
            onRemoveWorkMode={(mode) =>
              setFilters((prev) => ({
                ...prev,
                workModes: prev.workModes.filter((m) => m !== mode),
              }))
            }
            onRemoveExperience={(level) =>
              setFilters((prev) => ({
                ...prev,
                experienceLevels: prev.experienceLevels.filter((l) => l !== level),
              }))
            }
            onRemoveContract={(type) =>
              setFilters((prev) => ({
                ...prev,
                contractTypes: prev.contractTypes.filter((t) => t !== type),
              }))
            }
            onClearAll={() => setFilters(emptyJobSearchFilters)}
          />
        </div>

        {error ? (
          <div className="mt-6">
            <ErrorBlock message={error} onRetry={() => void fetchJobs(page)} />
          </div>
        ) : (
          <div className="mt-5 grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,42%)] 2xl:grid-cols-[minmax(0,1fr)_minmax(420px,38%)]">
            <section className="flex min-h-[640px] flex-col overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-lowest)] shadow-[0_1px_4px_rgba(0,30,64,0.06)]">
              <div className="border-b border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-low)] px-5 py-3.5 sm:px-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
                  {filtered.length} offre{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <JobCardGrid
                  jobs={filtered}
                  selectedId={selectedJob?.id ?? null}
                  appliedJobIds={appliedJobIds}
                  loading={loading}
                  large
                  onSelect={(jobId) => {
                    setSelectedId(jobId);
                    setMobileDetailOpen(true);
                  }}
                />
              </div>

              {totalPages > 1 && !keyword && activeFilterCount === 0 ? (
                <div className="flex items-center justify-between border-t border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-low)] px-5 py-3 text-sm sm:px-6">
                  <button
                    type="button"
                    onClick={() => void fetchJobs(page - 1)}
                    disabled={page === 0 || loading}
                    className="rounded-lg px-3 py-2 font-semibold text-[var(--primary)] disabled:opacity-40"
                  >
                    Précédent
                  </button>
                  <span className="text-[var(--on-surface-variant)]">
                    Page {page + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => void fetchJobs(page + 1)}
                    disabled={page >= totalPages - 1 || loading}
                    className="rounded-lg px-3 py-2 font-semibold text-[var(--primary)] disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </div>
              ) : null}
            </section>

            <section className="hidden min-h-[640px] flex-col overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-lowest)] shadow-[0_1px_4px_rgba(0,30,64,0.06)] xl:sticky xl:top-6 xl:flex xl:max-h-[calc(100vh-6rem)]">
              <div className="border-b border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-low)] px-6 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
                  Détail de l&apos;offre
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                {selectedJob ? (
                  <>
                    <h2 className="font-headline text-2xl font-extrabold leading-tight text-[var(--primary)] xl:text-3xl">
                      {selectedJob.title}
                    </h2>
                    <JobLocationLine
                      location={selectedJob.location}
                      className="mt-2 text-sm"
                    />

                    {selectedJob.companyName ? (
                      <div className="mt-5">
                        <JobCompanySummary job={selectedJob} />
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <JobWorkModeBadge workMode={selectedJob.workMode} />
                      <JobContractBadge contractType={selectedJob.contractType} />
                      {selectedJob.experienceLevel ? (
                        <JobExperienceBadge level={selectedJob.experienceLevel} />
                      ) : null}
                    </div>

                    {salaryLabel ? (
                      <JobSalaryLine
                        label={salaryLabel}
                        className="mt-5 text-base"
                      />
                    ) : null}

                    <div className="mt-8 border-t border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] pt-6">
                      <h3 className="text-sm font-bold text-[var(--primary)]">
                        {JOB_META.description} Description du poste
                      </h3>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--on-surface-variant)]">
                        {selectedJob.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title="Sélectionnez une offre"
                    description="Cliquez sur une offre dans la liste pour afficher les détails."
                  />
                )}
              </div>

              {selectedJob ? (
                <div className="border-t border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-low)] p-5">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/jobs/${selectedJob.id}`}
                      className="btn-primary rounded-xl px-6 py-3 text-sm"
                    >
                      Voir l&apos;offre complète
                    </Link>
                    {user?.role === "CANDIDATE" ? (
                      <button
                        type="button"
                        onClick={() => void applyToJob(selectedJob.id)}
                        disabled={
                          applyingJobId === selectedJob.id ||
                          appliedJobIds.includes(selectedJob.id)
                        }
                        className="rounded-xl border border-[color-mix(in_srgb,var(--outline-variant)_25%,transparent)] bg-white px-6 py-3 text-sm font-semibold text-[var(--primary)] disabled:opacity-50"
                      >
                        {appliedJobIds.includes(selectedJob.id)
                          ? "Candidature envoyée"
                          : applyingJobId === selectedJob.id
                            ? "Envoi…"
                            : "Postuler"}
                      </button>
                    ) : !user ? (
                      <Link
                        href="/login"
                        className="rounded-xl border border-[color-mix(in_srgb,var(--outline-variant)_25%,transparent)] bg-white px-6 py-3 text-sm font-semibold text-[var(--primary)]"
                      >
                        Se connecter pour postuler
                      </Link>
                    ) : null}
                  </div>
                  {applyMsg ? (
                    <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
                      {applyMsg}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        )}

        {selectedJob && mobileDetailOpen ? (
          <div
            className="fixed inset-0 z-50 xl:hidden"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Fermer"
              onClick={() => setMobileDetailOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[var(--surface-container-lowest)] p-5 shadow-[0_-8px_32px_rgba(0,30,64,0.15)]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
                  Détail de l&apos;offre
                </p>
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="rounded-full px-3 py-1 text-sm font-semibold text-[var(--primary)]"
                >
                  Fermer
                </button>
              </div>
              <h2 className="font-headline text-xl font-extrabold text-[var(--primary)]">
                {selectedJob.title}
              </h2>
              <JobLocationLine
                location={selectedJob.location}
                className="mt-2 text-sm"
              />
              {selectedJob.companyName ? (
                <div className="mt-3">
                  <JobCompanySummary job={selectedJob} compact />
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <JobWorkModeBadge workMode={selectedJob.workMode} />
                <JobContractBadge contractType={selectedJob.contractType} />
              </div>
              {salaryLabel ? (
                <JobSalaryLine label={salaryLabel} className="mt-4 text-base" />
              ) : null}
              <p className="mt-4 line-clamp-6 whitespace-pre-wrap text-sm leading-6 text-[var(--on-surface-variant)]">
                {selectedJob.description}
              </p>
              <div className="sticky bottom-0 mt-6 flex flex-wrap gap-3 border-t border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-lowest)] pt-4">
                <Link
                  href={`/jobs/${selectedJob.id}`}
                  className="btn-primary rounded-xl px-6 py-3 text-sm"
                >
                  Voir l&apos;offre complète
                </Link>
                {user?.role === "CANDIDATE" ? (
                  <button
                    type="button"
                    onClick={() => void applyToJob(selectedJob.id)}
                    disabled={
                      applyingJobId === selectedJob.id ||
                      appliedJobIds.includes(selectedJob.id)
                    }
                    className="rounded-xl border border-[color-mix(in_srgb,var(--outline-variant)_25%,transparent)] bg-white px-6 py-3 text-sm font-semibold text-[var(--primary)] disabled:opacity-50"
                  >
                    {appliedJobIds.includes(selectedJob.id)
                      ? "Candidature envoyée"
                      : applyingJobId === selectedJob.id
                        ? "Envoi…"
                        : "Postuler"}
                  </button>
                ) : !user ? (
                  <Link
                    href="/login"
                    className="rounded-xl border border-[color-mix(in_srgb,var(--outline-variant)_25%,transparent)] bg-white px-6 py-3 text-sm font-semibold text-[var(--primary)]"
                  >
                    Se connecter pour postuler
                  </Link>
                ) : null}
              </div>
              {applyMsg ? (
                <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
                  {applyMsg}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </CandidateContent>
  );
}
