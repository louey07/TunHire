"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPublicGet } from "@/lib/api";
import { getUser } from "@/lib/auth";

type Job = {
  id: number;
  title: string;
  location: string;
  contractType: string;
  description: string;
  companyName?: string | null;
  experienceLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  aiScore?: number;
  aiLevel?: string | null;
  matchedSkills?: string[];
};

type JobsPageResponse = {
  content?: Job[];
  totalPages?: number;
  number?: number;
};

type JobMatchResponse = {
  job: Omit<Job, "aiScore" | "aiLevel" | "matchedSkills">;
  score: number;
  level?: string | null;
  matchedSkills?: string[];
};

type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "CANDIDATE" | "RECRUITER";
};

type ApplicationSummary = {
  id: number;
  jobId?: number;
  status?: string;
};

export default function JobsPage() {
  const router = useRouter();
  const [user] = useState<User | null>(() => getUser());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [minMatch, setMinMatch] = useState(84);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [applyMsg, setApplyMsg] = useState("");

  useEffect(() => {
    if (user?.role === "CANDIDATE") {
      void fetchCandidateMatches(0);
      void loadApplications(user.id);
      return;
    }
    void fetchJobs(0);
  }, [user]);

  async function fetchJobs(p: number) {
    setLoading(true);
    setError("");
    try {
      const data = await apiPublicGet(`/jobs?page=${p}&size=10`);
      if (!data?.success) {
        setError("Impossible de charger les offres pour le moment.");
        setJobs([]);
        return;
      }

      const pageData = (data.data || {}) as JobsPageResponse;
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

  async function fetchCandidateMatches(p: number) {
    setLoading(true);
    setError("");
    try {
      const pageData = (await apiGet(
        `/candidates/me/job-matches?page=${p}&size=10`,
      )) as {
        content?: JobMatchResponse[];
        totalPages?: number;
        number?: number;
      };
      const mappedJobs = (pageData.content || []).map((entry) => ({
        ...entry.job,
        aiScore: entry.score,
        aiLevel: entry.level || null,
        matchedSkills: entry.matchedSkills || [],
      }));
      setJobs(mappedJobs);
      setTotalPages(pageData.totalPages || 0);
      setPage(pageData.number ?? p);
    } catch {
      setError("Erreur de connexion lors du chargement du ranking IA.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications(userId: number) {
    try {
      const data = await apiGet(`/applications?userId=${userId}`);
      if (!data?.success) return;
      const applications = (data.data || []) as ApplicationSummary[];
      const jobIds = applications
        .map((item) => item.jobId)
        .filter((jobId): jobId is number => typeof jobId === "number");
      setAppliedJobIds(jobIds);
    } catch {}
  }

  const filterOptions = [
    {
      id: "remote",
      label: "Remote only",
      matcher: (job: Job) =>
        job.location.toLowerCase().includes("remote") ||
        job.description.toLowerCase().includes("remote"),
    },
    {
      id: "hybrid",
      label: "Hybrid",
      matcher: (job: Job) =>
        job.location.toLowerCase().includes("hybrid") ||
        job.description.toLowerCase().includes("hybrid"),
    },
    {
      id: "onsite",
      label: "On-site",
      matcher: (job: Job) =>
        job.location.toLowerCase().includes("on-site") ||
        job.location.toLowerCase().includes("onsite") ||
        job.description.toLowerCase().includes("on-site") ||
        job.description.toLowerCase().includes("onsite"),
    },
    {
      id: "freelance",
      label: "Freelance",
      matcher: (job: Job) =>
        job.contractType.toLowerCase().includes("freelance"),
    },
    {
      id: "internship",
      label: "Internships",
      matcher: (job: Job) =>
        job.contractType.toLowerCase().includes("intern") ||
        job.description.toLowerCase().includes("intern"),
    },
  ];

  function toggleFilter(id: string) {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }

  function getMatchScore(job: Job): number | null {
    if (typeof job.aiScore === "number") return job.aiScore;
    return null;
  }

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
      const data = await apiPost("/applications", { jobId });
      if (data?.success) {
        setAppliedJobIds((prev) => [...prev, jobId]);
        setApplyMsg("Votre candidature a été envoyée avec succès.");
      } else {
        setApplyMsg(data?.message || "Impossible d’envoyer la candidature.");
      }
    } catch {
      setApplyMsg("Erreur de connexion pendant la candidature.");
    } finally {
      setApplyingJobId(null);
    }
  }

  const filtered = jobs
    .filter((j) =>
      search
        ? j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.location.toLowerCase().includes(search.toLowerCase()) ||
          (j.companyName || "").toLowerCase().includes(search.toLowerCase())
        : true,
    )
    .filter((j) =>
      activeFilters.length
        ? activeFilters.some((id) =>
            filterOptions.find((f) => f.id === id)?.matcher(j),
          )
        : true,
    )
    .filter((j) => user?.role !== "CANDIDATE" || (getMatchScore(j) ?? -1) >= minMatch);

  const selectedJob = useMemo(() => {
    if (!filtered.length) return null;
    return filtered.find((job) => job.id === selectedId) ?? filtered[0];
  }, [filtered, selectedId]);

  const selectedScore = selectedJob ? getMatchScore(selectedJob) : null;
  const isCandidate = user?.role === "CANDIDATE";
  const hasAppliedToSelected = selectedJob
    ? appliedJobIds.includes(selectedJob.id)
    : false;

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <nav
        className={`fixed top-0 z-50 w-full glass-nav${isCandidate ? " lg:pl-64" : ""}`}
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-8 py-5 xl:px-10">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-[var(--primary)]"
          >
            TunHire
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/jobs"
              className="text-sm font-semibold text-[var(--secondary)]"
            >
              Jobs
            </Link>
            <Link
              href="/dashboard/candidate/applications"
              className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
            >
              Applications
            </Link>
            <Link
              href="/dashboard/candidate"
              className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
            >
              IA Match
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href={
                  user.role === "RECRUITER"
                    ? "/dashboard/recruiter"
                    : "/dashboard/candidate"
                }
                className="flex items-center gap-3 rounded-full bg-[var(--surface-container-low)] px-3 py-2 text-sm font-semibold text-[var(--primary)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                  {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}
                </span>
                {user.firstName}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[var(--on-surface-variant)] transition-colors hover:text-[var(--primary)]"
                >
                  Connexion
                </Link>
                <Link
                  href="/login?view=register"
                  className="rounded-2xl bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--on-primary)] shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {isCandidate ? (
        <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-[var(--surface-container-low)] px-4 py-8 lg:flex">
          <div className="mb-10 px-2">
            <h1 className="text-xl font-extrabold tracking-tight text-[var(--primary)] font-headline">
              TunHire Nexus
            </h1>
            <p className="label-uppercase mt-1 text-[10px] font-semibold text-[var(--on-surface-variant)]">
              AI Talent Platform
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            <Link
              href="/dashboard/candidate"
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
            >
              <span>Tableau de bord</span>
            </Link>
            <Link
              href="/dashboard/candidate/applications"
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
            >
              <span>Mes Candidatures</span>
            </Link>
            <Link
              href="/jobs"
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition bg-[color-mix(in_srgb,var(--surface-container-high)_70%,transparent)] text-[var(--primary)]"
            >
              <span>Trouver un Job</span>
              <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
            </Link>
            <Link
              href="/dashboard/candidate"
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
            >
              <span>Messages</span>
            </Link>
            <Link
              href="/dashboard/candidate"
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-high)]"
            >
              <span>Profil</span>
            </Link>
          </nav>
        </aside>
      ) : null}

      <div
        className={`mx-auto flex w-full max-w-[1600px] gap-10 px-8 pb-16 pt-32 xl:px-10${isCandidate ? " lg:pl-64" : ""}`}
      >
        <aside className="sticky top-32 hidden h-[calc(100vh-8rem)] w-80 flex-col gap-10 self-start overflow-y-auto rounded-[2rem] bg-[var(--surface-container-low)] p-7 xl:flex">
          <div>
            <p className="text-lg font-semibold text-[var(--primary)]">
              Filtres
            </p>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Affinez par affinite IA
            </p>
          </div>
          <div className="space-y-3">
            {filterOptions.map((filter) => {
              const isActive = activeFilters.includes(filter.id);
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-container-lowest)] text-[var(--primary)]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${isActive ? "bg-white" : "bg-[var(--secondary)]"}`}
                  />
                  {filter.label}
                </button>
              );
            })}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
              Min AI match
            </p>
            <div className="mt-4">
              <input
                type="range"
                min={80}
                max={99}
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                <span>80</span>
                <span>{minMatch}%</span>
                <span>99</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="rounded-[2.75rem] bg-[var(--surface-container-low)] p-10 editorial-shadow xl:p-12">
            <span className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
              Moteur IA TunHire
            </span>
            <h1 className="mt-5 max-w-4xl font-headline text-4xl font-extrabold leading-tight text-[var(--primary)] md:text-5xl xl:text-[3.6rem]">
              Decouvrez votre prochaine opportunite en Tunisie.
            </h1>
            <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--secondary)]">
                  AI
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par titre, entreprise ou localisation..."
                  className="w-full rounded-[1.4rem] bg-[var(--surface-container-lowest)] py-5 pl-12 pr-5 text-[15px] font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl soft-outline" />
              </div>
            </div>
          </header>

          {error && (
            <div className="mt-6 rounded-3xl bg-[#ffdad6] p-4 text-sm text-[#93000a]">
              {error}
            </div>
          )}

          <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(420px,560px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(460px,620px)_minmax(0,1fr)]">
            <section className="flex flex-col gap-5">
              {loading ? (
                <div className="rounded-3xl bg-[var(--surface-container-low)] p-6 text-sm text-[var(--on-surface-variant)]">
                  Chargement des opportunites...
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((job) => {
                  const score = getMatchScore(job);
                  const isActive = selectedJob?.id === job.id;
                  const alreadyApplied = appliedJobIds.includes(job.id);
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(job.id);
                        setApplyMsg("");
                      }}
                      className={`group relative overflow-hidden rounded-[2rem] p-6 text-left transition-all xl:p-7 ${
                        isActive
                          ? "bg-[var(--surface-container-lowest)] shadow-lg"
                          : "bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-lowest)]"
                      }`}
                    >
                      {score !== null && (
                        <div className="absolute right-0 top-0 rounded-bl-2xl bg-gradient-to-r from-[var(--secondary)] to-[var(--tertiary)] px-3 py-1 text-[10px] font-bold uppercase text-white">
                          {score}% match
                        </div>
                      )}
                      <div className="flex items-start gap-5 xl:gap-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[var(--surface-container-highest)] text-sm font-bold text-[var(--primary)] xl:h-16 xl:w-16">
                          {job.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 pr-6">
                          <h3 className="font-headline text-xl font-bold text-[var(--primary)] xl:text-[1.4rem]">
                            {job.title}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--on-surface-variant)] xl:text-[15px]">
                            {job.companyName
                              ? `${job.companyName} · ${job.location}`
                              : job.location}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <span className="rounded-full bg-[var(--surface-container-highest)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                          {job.contractType}
                        </span>
                        {job.aiLevel && user?.role === "CANDIDATE" && (
                          <span className="rounded-full bg-[var(--secondary)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
                            {job.aiLevel}
                          </span>
                        )}
                        {alreadyApplied && (
                          <span className="rounded-full bg-[var(--tertiary)]/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                            Deja postule
                          </span>
                        )}
                      </div>
                      <p className="mt-5 max-w-[48ch] text-sm leading-7 text-[var(--on-surface-variant)] xl:text-[15px]">
                        {job.description?.slice(0, 110) ||
                          "Profil analyse par l IA pour optimiser votre match."}
                        {job.description && job.description.length > 110
                          ? "..."
                          : ""}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-3xl bg-[var(--surface-container-low)] p-6 text-sm text-[var(--on-surface-variant)]">
                  Aucune offre trouvee.
                </div>
              )}

              {totalPages > 1 && !search && (
                <div className="flex items-center justify-between rounded-3xl bg-[var(--surface-container-low)] px-5 py-4 text-sm text-[var(--on-surface-variant)]">
                  <button
                    type="button"
                    onClick={() =>
                      void (user?.role === "CANDIDATE"
                        ? fetchCandidateMatches(page - 1)
                        : fetchJobs(page - 1))
                    }
                    disabled={page === 0}
                    className="rounded-2xl bg-[var(--surface-container-lowest)] px-4 py-2 text-sm font-semibold text-[var(--primary)] disabled:opacity-40"
                  >
                    Precedent
                  </button>
                  <span>
                    Page {page + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void (user?.role === "CANDIDATE"
                        ? fetchCandidateMatches(page + 1)
                        : fetchJobs(page + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="rounded-2xl bg-[var(--surface-container-lowest)] px-4 py-2 text-sm font-semibold text-[var(--primary)] disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-[2.75rem] bg-[var(--surface-container-lowest)] p-10 editorial-shadow xl:p-12">
              {selectedJob ? (
                <>
                  <div className="relative overflow-hidden rounded-[2.25rem] bg-[var(--primary)] p-8 text-white xl:p-10">
                    <div className="absolute inset-0 opacity-40">
                      <img
                        alt="Bureau moderne"
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                      />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--secondary-bright)]">
                        AI Insight
                      </p>
                      <h2 className="mt-3 max-w-3xl font-headline text-3xl font-extrabold leading-tight xl:text-[2.5rem]">
                        {selectedJob.title}
                      </h2>
                      <p className="mt-3 text-base text-white/70 xl:text-lg">
                        {selectedJob.companyName
                          ? `${selectedJob.companyName} · ${selectedJob.location}`
                          : selectedJob.location}
                      </p>
                      {selectedScore !== null && (
                        <div className="mt-6 flex items-center gap-4">
                          <div className="h-2 flex-1 rounded-full bg-white/20">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-[var(--secondary)] to-[var(--tertiary)]"
                              style={{ width: `${selectedScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">
                            {selectedScore}% match
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 space-y-7">
                    <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-6 xl:p-7">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                        Resume
                      </p>
                      <p className="mt-4 max-w-[70ch] text-sm leading-8 text-[var(--on-surface-variant)] xl:text-[15px]">
                        {selectedJob.description ||
                          "Cette opportunite combine expertise locale et innovation IA. Votre profil peut etre mis en avant grace a un scoring transparent."}
                      </p>
                      {user?.role === "CANDIDATE" &&
                        selectedJob.matchedSkills &&
                        selectedJob.matchedSkills.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2.5">
                            {selectedJob.matchedSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-[var(--secondary)]/12 px-3 py-1 text-[11px] font-semibold text-[var(--secondary)]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="grid gap-5 sm:grid-cols-3">
                      <div className="rounded-[1.6rem] bg-[var(--surface-container-low)] p-5 text-center xl:p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                          Contrat
                        </p>
                        <p className="mt-3 text-sm font-semibold text-[var(--primary)] xl:text-[15px]">
                          {selectedJob.contractType}
                        </p>
                      </div>
                      <div className="rounded-[1.6rem] bg-[var(--surface-container-low)] p-5 text-center xl:p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                          Experience
                        </p>
                        <p className="mt-3 text-sm font-semibold text-[var(--primary)] xl:text-[15px]">
                          {selectedJob.experienceLevel || "Non precisee"}
                        </p>
                      </div>
                      <div className="rounded-[1.6rem] bg-[var(--surface-container-low)] p-5 text-center xl:p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                          Compatibilite
                        </p>
                        <p className="mt-3 text-sm font-semibold text-[var(--primary)] xl:text-[15px]">
                          {selectedScore !== null ? `${selectedScore}%` : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 pt-2">
                      <Link
                        href={`/jobs/${selectedJob.id}`}
                        className="rounded-[1.4rem] bg-[var(--primary)] px-7 py-3.5 text-sm font-semibold text-[var(--on-primary)] shadow-lg"
                      >
                        Voir l offre
                      </Link>
                      <button
                        type="button"
                        onClick={() => void applyToJob(selectedJob.id)}
                        disabled={
                          applyingJobId === selectedJob.id ||
                          hasAppliedToSelected
                        }
                        className="rounded-[1.4rem] bg-[var(--secondary-bright)] px-7 py-3.5 text-sm font-semibold text-[var(--primary)] disabled:opacity-50"
                      >
                        {hasAppliedToSelected
                          ? "Candidature envoyee"
                          : applyingJobId === selectedJob.id
                            ? "Envoi en cours..."
                            : "Postuler"}
                      </button>
                    </div>
                    {applyMsg && (
                      <div
                        className={`rounded-[1.4rem] px-5 py-4 text-sm ${applyMsg.includes("succes") || applyMsg.includes("envoyee") ? "bg-[color-mix(in_srgb,var(--tertiary)_30%,white)] text-[var(--primary)]" : "bg-[#ffdad6] text-[#93000a]"}`}
                      >
                        {applyMsg}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-3xl bg-[var(--surface-container-low)] p-6 text-sm text-[var(--on-surface-variant)]">
                  Selectionnez une offre pour afficher les details.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
