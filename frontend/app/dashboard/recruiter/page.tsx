"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import Navbar from "@/components/Navbar";
import RecruiterSidebar from "@/components/RecruiterSidebar";

type Application = {
  id: number;
  status: string;
  score?: number;
  level?: string;
  candidate?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

type CompanyMembership = {
  companyId: number;
  companyName: string;
  slug?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  role?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  IN_REVIEW: "En cours",
  SHORTLISTED: "Sélectionné",
  REJECTED: "Rejeté",
};

const STATUS_TONES: Record<string, string> = {
  IN_REVIEW: "bg-[#9cf0ff]/40 text-[#004f58]",
  SHORTLISTED: "bg-[#69ff87]/40 text-[#00531e]",
  REJECTED: "bg-[#ffdad6] text-[#93000a]",
};

const ROLE_LABELS: Record<string, string> = {
  RECRUITER_ADMIN: "Admin",
  MEMBER: "Membre",
};

export default function RecruiterDashboard() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [companyMsg, setCompanyMsg] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("tunhire_company_id");
  });
  const [companyOptions, setCompanyOptions] = useState<CompanyMembership[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companySelectMsg, setCompanySelectMsg] = useState("");
  const [activeCompany, setActiveCompany] = useState<CompanyMembership | null>(
    null,
  );
  const [inviteToken, setInviteToken] = useState("");
  const [joiningCompany, setJoiningCompany] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [jobSalaryMin, setJobSalaryMin] = useState("");
  const [jobSalaryMax, setJobSalaryMax] = useState("");
  const [postingJob, setPostingJob] = useState(false);
  const [jobMsg, setJobMsg] = useState("");

  const [companyJobs, setCompanyJobs] = useState<
    { id: number; title: string }[]
  >([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsMsg, setAppsMsg] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const rankingRef = useRef<HTMLElement>(null);
  const companySectionRef = useRef<HTMLElement>(null);
  const postJobRef = useRef<HTMLElement>(null);
  const activeJob = companyJobs.find((job) => String(job.id) === selectedJobId);
  const topCandidate = applications[0];
  const inputClass =
    "w-full rounded-2xl bg-[#ffffff] px-4 py-3 text-sm text-[#191c1e] ring-1 ring-[#c3c6d1]/20 focus:outline-none focus:ring-2 focus:ring-[#00daf3]/40 transition";

  function normalizeInviteToken(value: string) {
    const raw = value.trim();
    if (!raw) return "";
    try {
      const url = new URL(raw);
      const token = url.searchParams.get("token");
      if (token) return token;
    } catch {}
    const tokenIndex = raw.indexOf("token=");
    if (tokenIndex >= 0) {
      return raw.slice(tokenIndex + 6).split(/[&#]/)[0];
    }
    if (raw.includes("/")) {
      const parts = raw.split("/").filter(Boolean);
      return parts[parts.length - 1] || raw;
    }
    return raw;
  }

  async function loadCompanyOptions(preferredId?: string | null) {
    setLoadingCompanies(true);
    setCompanySelectMsg("");
    try {
      const data = await apiGet("/companies/mine");
      if (data.success) {
        const list = (data.data || []) as CompanyMembership[];
        setCompanyOptions(list);
        const stored =
          preferredId || localStorage.getItem("tunhire_company_id");
        if (stored) {
          const match = list.find(
            (company) => String(company.companyId) === stored,
          );
          if (match) {
            selectCompany(match);
          } else {
            localStorage.removeItem("tunhire_company_id");
            setCompanyId(null);
            setActiveCompany(null);
          }
        }
      } else {
        setCompanySelectMsg("Erreur lors du chargement des entreprises");
      }
    } catch {
      setCompanySelectMsg("Erreur de connexion");
    } finally {
      setLoadingCompanies(false);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    void loadCompanyOptions(companyId);
  }, [companyId, router]);

  function selectCompany(company: CompanyMembership) {
    const id = String(company.companyId);
    localStorage.setItem("tunhire_company_id", id);
    setCompanyId(id);
    setActiveCompany(company);
    setSelectedJobId("");
    setApplications([]);
    setAppsMsg("");
    fetchCompanyJobs(id);
  }

  function resetCompanySelection() {
    localStorage.removeItem("tunhire_company_id");
    setCompanyId(null);
    setActiveCompany(null);
    setSelectedJobId("");
    setApplications([]);
    setAppsMsg("");
  }

  async function acceptInvite() {
    const token = normalizeInviteToken(inviteToken);
    if (!token) return;
    setJoiningCompany(true);
    setInviteMsg("");
    try {
      const data = await apiPost("/companies/invites/accept", { token });
      if (data.success) {
        const id = String(data.data.companyId);
        localStorage.setItem("tunhire_company_id", id);
        setInviteMsg("Invitation acceptée. Entreprise ajoutée.");
        setInviteToken("");
        await loadCompanyOptions(id);
      } else {
        setInviteMsg("Lien invalide ou expiré.");
      }
    } catch {
      setInviteMsg("Erreur de connexion");
    } finally {
      setJoiningCompany(false);
    }
  }

  async function createCompany() {
    if (!companyName.trim()) return;
    setCreatingCompany(true);
    setCompanyMsg("");
    try {
      const data = await apiPost("/companies", {
        name: companyName.trim(),
        industry: companyIndustry.trim(),
      });
      if (data.success) {
        const createdCompany: CompanyMembership = {
          companyId: data.data.id,
          companyName: data.data.name,
          slug: data.data.slug,
          logoUrl: data.data.logoUrl,
          location: data.data.location,
          role: "RECRUITER_ADMIN",
        };
        setCompanyOptions((prev) => [
          createdCompany,
          ...prev.filter((item) => item.companyId !== createdCompany.companyId),
        ]);
        selectCompany(createdCompany);
        setCompanyName("");
        setCompanyIndustry("");
        setCompanyMsg("Entreprise créée avec succès !");
      } else {
        setCompanyMsg("Erreur lors de la création");
      }
    } catch {
      setCompanyMsg("Erreur de connexion");
    } finally {
      setCreatingCompany(false);
    }
  }

  async function fetchCompanyJobs(cId: string) {
    try {
      const data = await apiGet(`/companies/${cId}/jobs`);
      if (data.success) {
        setCompanyJobs(data.data || []);
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      {/* Hide the top navbar on large screens since we have a sidebar */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      <RecruiterSidebar activeItem="overview" />

      <div className="relative overflow-hidden lg:ml-[260px]">
        <div className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-[#00daf3]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-44 left-[-12%] h-[360px] w-[360px] rounded-full bg-[#69ff87]/20 blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 pb-16 pt-10">
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                  Recruiter Nexus
                </span>
                <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-[#001e40]">
                  Orchestrer votre pipeline de talents.
                </h1>
                <p className="text-sm text-[#43474f] max-w-xl">
                  Centralisez vos offres, suivez le ranking IA et pilotez les
                  décisions de recrutement depuis un tableau de bord conçu comme
                  un studio éditorial premium.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/recruiter/jobs")}
                  className="rounded-full bg-[#001e40] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(0,30,64,0.25)] transition hover:opacity-90"
                >
                  Publier une offre
                </button>
                <span className="rounded-full bg-[#e0e3e5] px-4 py-2 text-[11px] font-semibold text-[#004f58]">
                  AI Match Engine actif
                </span>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <section
                  ref={companySectionRef}
                  className="rounded-[28px] bg-[#f2f4f6] p-1"
                >
                  <div className="rounded-[24px] bg-white p-6 shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
                    {!companyId ? (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                              Entreprise
                            </span>
                            <h2 className="text-2xl font-headline font-bold text-[#001e40]">
                              Accès entreprise
                            </h2>
                            <p className="mt-2 text-sm text-[#43474f]">
                              Rejoignez une équipe, sélectionnez une entreprise
                              existante ou créez votre propre structure.
                            </p>
                          </div>
                          <span className="rounded-full bg-[#f2f4f6] px-3 py-1 text-[11px] font-semibold text-[#43474f]">
                            Étape 1
                          </span>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                          <div className="rounded-2xl bg-[#f2f4f6] p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                                  Invite
                                </span>
                                <h3 className="text-lg font-headline font-bold text-[#001e40]">
                                  Rejoindre une équipe
                                </h3>
                                <p className="mt-2 text-sm text-[#43474f]">
                                  Collez un lien d&apos;invitation ou un token
                                  pour accéder à une entreprise.
                                </p>
                              </div>
                              <span className="rounded-full bg-[#e0e3e5] px-3 py-1 text-[11px] font-semibold text-[#43474f]">
                                Rapide
                              </span>
                            </div>
                            <div className="mt-4 space-y-3">
                              <input
                                type="text"
                                value={inviteToken}
                                onChange={(e) => setInviteToken(e.target.value)}
                                placeholder="Lien ou token d'invite"
                                className={inputClass}
                              />
                              <button
                                type="button"
                                onClick={acceptInvite}
                                disabled={joiningCompany || !inviteToken.trim()}
                                className="w-full rounded-full bg-[#001e40] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(0,30,64,0.25)] transition hover:opacity-90 disabled:opacity-60"
                              >
                                {joiningCompany ? "Connexion..." : "Rejoindre"}
                              </button>
                              {inviteMsg && (
                                <p
                                  className={`text-sm ${inviteMsg.includes("acceptée") ? "text-[#00531e]" : "text-[#93000a]"}`}
                                >
                                  {inviteMsg}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-[#f2f4f6] p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                                  Équipes
                                </span>
                                <h3 className="text-lg font-headline font-bold text-[#001e40]">
                                  Choisir une entreprise
                                </h3>
                                <p className="mt-2 text-sm text-[#43474f]">
                                  Sélectionnez une entreprise dont vous êtes
                                  déjà membre.
                                </p>
                              </div>
                              <span className="rounded-full bg-[#e0e3e5] px-3 py-1 text-[11px] font-semibold text-[#43474f]">
                                {loadingCompanies
                                  ? "Sync..."
                                  : `${companyOptions.length} disponible`}
                              </span>
                            </div>
                            <div className="mt-4 space-y-3">
                              {loadingCompanies ? (
                                <p className="text-sm text-[#43474f]">
                                  Chargement des entreprises...
                                </p>
                              ) : companyOptions.length === 0 ? (
                                <p className="text-sm text-[#43474f]">
                                  Aucune entreprise liée pour le moment.
                                </p>
                              ) : (
                                companyOptions.map((company) => (
                                  <button
                                    key={company.companyId}
                                    type="button"
                                    onClick={() => selectCompany(company)}
                                    className="flex w-full items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 text-left shadow-[0_16px_30px_rgba(25,28,30,0.08)] transition hover:-translate-y-0.5"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-[#001e40]">
                                        {company.companyName}
                                      </p>
                                      <p className="mt-1 text-xs text-[#43474f]">
                                        {company.location ||
                                          "Localisation non renseignée"}
                                      </p>
                                    </div>
                                    <span className="rounded-full bg-[#e0e3e5] px-3 py-1 text-[11px] font-semibold text-[#43474f]">
                                      {ROLE_LABELS[company.role ?? ""] ||
                                        "Membre"}
                                    </span>
                                  </button>
                                ))
                              )}
                              {companySelectMsg && (
                                <p className="text-sm text-[#93000a]">
                                  {companySelectMsg}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-[#f2f4f6] p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                                Création
                              </span>
                              <h3 className="text-lg font-headline font-bold text-[#001e40]">
                                Créer une entreprise
                              </h3>
                              <p className="mt-2 text-sm text-[#43474f]">
                                Lancez votre propre structure et activez la
                                publication d&apos;offres.
                              </p>
                            </div>
                            <span className="rounded-full bg-[#e0e3e5] px-3 py-1 text-[11px] font-semibold text-[#43474f]">
                              Nouveau
                            </span>
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="label-uppercase text-[10px] font-semibold text-[#43474f]">
                                Nom de l&apos;entreprise
                              </label>
                              <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="TunTech SARL"
                                className={inputClass}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="label-uppercase text-[10px] font-semibold text-[#43474f]">
                                Secteur d&apos;activité
                              </label>
                              <input
                                type="text"
                                value={companyIndustry}
                                onChange={(e) =>
                                  setCompanyIndustry(e.target.value)
                                }
                                placeholder="Technologie, Finance, Santé..."
                                className={inputClass}
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={createCompany}
                              disabled={creatingCompany || !companyName.trim()}
                              className="rounded-full bg-[#00e3fd] px-5 py-3 text-sm font-semibold text-[#001f24] shadow-[0_20px_40px_rgba(0,103,117,0.2)] transition hover:opacity-90 disabled:opacity-60"
                            >
                              {creatingCompany
                                ? "Création..."
                                : "Créer l'entreprise"}
                            </button>
                            {companyMsg && (
                              <p
                                className={`text-sm ${companyMsg.includes("!") ? "text-[#00531e]" : "text-[#93000a]"}`}
                              >
                                {companyMsg}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[22px] bg-[linear-gradient(135deg,#001e40,#003366)] p-6 text-white">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <span className="label-uppercase text-[10px] font-semibold text-white/70">
                              Entreprise active
                            </span>
                            <h2 className="text-2xl font-headline font-bold">
                              {activeCompany?.companyName ||
                                `Entreprise #${companyId}`}
                            </h2>
                            <p className="mt-2 text-sm text-white/70">
                              {activeCompany?.location ||
                                "Connectée aux offres, au ranking IA et aux signaux du marché."}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#9cf0ff]">
                              Live
                            </span>
                            <button
                              type="button"
                              onClick={resetCompanySelection}
                              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 transition hover:text-white"
                            >
                              Changer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#001e40,#003366)] p-6 text-white shadow-[0_24px_60px_rgba(0,30,64,0.25)]">
                  <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#00daf3]/20 blur-3xl" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="label-uppercase text-[10px] font-semibold text-[#9cf0ff]">
                          AI Match Engine
                        </span>
                        <h3 className="text-2xl font-headline font-bold">
                          Top candidates
                        </h3>
                        <p className="mt-2 text-sm text-white/70">
                          {activeJob
                            ? `Pour ${activeJob.title}`
                            : "Sélectionnez une offre pour activer le ranking."}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#9cf0ff]">
                        Live
                      </span>
                    </div>

                    {topCandidate ? (
                      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              {topCandidate.candidate?.firstName}{" "}
                              {topCandidate.candidate?.lastName}
                            </p>
                            <p className="text-xs text-white/60">
                              {topCandidate.candidate?.email ||
                                "Profil vérifié"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#69ff87]">
                              {topCandidate.score ?? 0}%
                            </div>
                            <div className="label-uppercase text-[9px] text-white/60">
                              Match
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-white/20">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, topCandidate.score ?? 0)}%`,
                              background:
                                "linear-gradient(90deg,#006875,#3ce36a)",
                            }}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                          {topCandidate.level && (
                            <span className="rounded-full bg-white/15 px-3 py-1">
                              {topCandidate.level}
                            </span>
                          )}
                          <span className="rounded-full bg-white/15 px-3 py-1">
                            AI trié
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/70">
                        Les meilleurs candidats apparaîtront ici dès qu&apos;une
                        offre est sélectionnée.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] bg-[#f2f4f6] p-1">
                  <div className="rounded-[24px] bg-white p-6 shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                          Pipeline Snapshot
                        </span>
                        <h3 className="text-2xl font-headline font-bold text-[#001e40]">
                          Nexus Insights
                        </h3>
                      </div>
                      <span className="rounded-full bg-[#e0e3e5] px-3 py-1 text-[11px] font-semibold text-[#43474f]">
                        {companyId ? "Live" : "Setup"}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#f2f4f6] p-4 text-center">
                        <p className="text-2xl font-headline font-bold text-[#001e40]">
                          {companyJobs.length}
                        </p>
                        <p className="label-uppercase text-[9px] text-[#43474f]">
                          Offres
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f2f4f6] p-4 text-center">
                        <p className="text-2xl font-headline font-bold text-[#001e40]">
                          0
                        </p>
                        <p className="label-uppercase text-[9px] text-[#43474f]">
                          Candidats
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#001e40]">
                          Taux de shortlist
                        </span>
                        <span className="font-bold text-[#006875]">0%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#e0e3e5]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `0%`,
                            background:
                              "linear-gradient(90deg,#006875,#00daf3)",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-[#43474f]">
                        <span>0 en cours de revue</span>
                        <span>0 clôturées</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
