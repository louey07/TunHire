"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import Navbar from "@/components/Navbar";
import RecruiterSidebar from "@/components/RecruiterSidebar";

type Application = {
  id: number;
  userId: number;
  status: string;
  score?: number;
  level?: string;
  candidateFirstName?: string;
  candidateLastName?: string;
  resumeUrl?: string;
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

export default function RecruiterCandidates() {
  const router = useRouter();

  const [companyJobs, setCompanyJobs] = useState<
    { id: number; title: string }[]
  >([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsMsg, setAppsMsg] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const activeJob = companyJobs.find((job) => String(job.id) === selectedJobId);

  const inputClass =
    "w-full rounded-2xl bg-[#ffffff] px-4 py-3 text-sm text-[#191c1e] ring-1 ring-[#c3c6d1]/20 focus:outline-none focus:ring-2 focus:ring-[#00daf3]/40 transition";

  const fetchCompanyJobs = async (cId: string) => {
    try {
      const data = await apiGet(`/companies/${cId}/jobs`);
      if (data.success) {
        setCompanyJobs(data.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    const stored = localStorage.getItem("tunhire_company_id");
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchCompanyJobs(stored);
    } else {
      router.push("/dashboard/recruiter");
    }
  }, [router]);

  async function fetchApplications(jobId: string) {
    setLoadingApps(true);
    setAppsMsg("");
    setApplications([]);
    try {
      const data = await apiGet(`/applications/job/${jobId}/ranked`);
      if (data.success) {
        setApplications(data.data || []);
        if ((data.data || []).length === 0)
          setAppsMsg("Aucune candidature pour cette offre.");
      } else {
        setAppsMsg("Erreur lors du chargement");
      }
    } catch {
      setAppsMsg("Erreur de connexion");
    } finally {
      setLoadingApps(false);
    }
  }

  async function updateStatus(appId: number, status: string) {
    setUpdatingStatusId(appId);
    try {
      await fetch(
        `http://localhost:8081/applications/${appId}/status?status=${status}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status } : a)),
      );
    } catch {}
    setUpdatingStatusId(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <div className="lg:hidden">
        <Navbar />
      </div>

      <RecruiterSidebar activeItem="candidates" />

      <div className="relative overflow-hidden lg:ml-[260px]">
        <div className="max-w-5xl mx-auto px-6 pb-16 pt-10">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-[#001e40]">
                Candidats & Applications
              </h1>
              <p className="text-sm text-[#43474f] max-w-xl">
                Parcourez les profils, consultez leurs CV, et mettez à jour
                l&apos;état de leur candidature pour vos offres.
              </p>
            </div>
          </header>

          <div className="rounded-[28px] bg-[#f2f4f6] p-1 mb-8">
            <div className="rounded-[24px] bg-white p-6 shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="label-uppercase text-[10px] font-semibold text-[#006875]">
                    AI Ranking
                  </span>
                  <h2 className="text-2xl font-headline font-bold text-[#001e40]">
                    Candidatures reçues
                  </h2>
                </div>
                {activeJob && (
                  <span className="rounded-full bg-[#e0e3e5] px-3 py-1 text-[11px] font-semibold text-[#43474f]">
                    {activeJob.title}
                  </span>
                )}
              </div>

              <div className="mt-5">
                {companyJobs.length === 0 ? (
                  <p className="text-sm text-[#43474f]">
                    Aucune offre publiée pour le moment.
                  </p>
                ) : (
                  <select
                    value={selectedJobId}
                    onChange={async (e) => {
                      const jobId = e.target.value;
                      setSelectedJobId(jobId);
                      setApplications([]);
                      setAppsMsg("");
                      if (jobId) await fetchApplications(jobId);
                    }}
                    disabled={loadingApps}
                    className={`${inputClass} bg-white disabled:opacity-60`}
                  >
                    <option value="">Sélectionner une offre...</option>
                    {companyJobs.map((job) => (
                      <option key={job.id} value={String(job.id)}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {appsMsg && (
            <p
              className={`mt-4 text-sm ${applications.length === 0 && !appsMsg.includes("Erreur") ? "text-[#43474f]" : "text-[#93000a]"}`}
            >
              {appsMsg}
            </p>
          )}

          <div className="space-y-4">
            {applications.map((app) => {
              const tone =
                STATUS_TONES[app.status] ?? "bg-[#f2f4f6] text-[#43474f]";
              const score = app.score ?? null;

              return (
                <div
                  key={app.id}
                  className="rounded-2xl bg-white p-5 shadow-[0_18px_40px_rgba(25,28,30,0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#001e40]">
                        {app.candidateFirstName} {app.candidateLastName}
                      </p>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (app.id) {
                              router.push(
                                `/dashboard/recruiter/candidates/${app.id}`,
                              );
                            }
                          }}
                          className="text-xs font-semibold text-[#00daf3] hover:text-[#006875] underline underline-offset-2 transition"
                        >
                          Voir Profil & CV
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {score !== null && (
                          <div className="flex items-center gap-2 rounded-full bg-[#f2f4f6] px-3 py-1">
                            <span className="label-uppercase text-[9px] font-semibold text-[#006875]">
                              AI match
                            </span>
                            <div className="h-2 w-16 rounded-full bg-white/70">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, score)}%`,
                                  background:
                                    "linear-gradient(90deg,#006875,#3ce36a)",
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[#001e40]">
                              {score}%
                            </span>
                          </div>
                        )}
                        {app.level && (
                          <span className="rounded-full bg-[#e0e3e5] px-3 py-1 text-[11px] font-semibold text-[#43474f]">
                            {app.level}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${tone}`}
                        >
                          {STATUS_LABELS[app.status] ?? app.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(
                          ["IN_REVIEW", "SHORTLISTED", "REJECTED"] as const
                        ).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateStatus(app.id, s)}
                            disabled={
                              updatingStatusId === app.id || app.status === s
                            }
                            className={`rounded-full px-4 py-2 text-[11px] font-semibold transition disabled:opacity-40 ${
                              app.status === s
                                ? "bg-[#001e40] text-white"
                                : "bg-[#f2f4f6] text-[#43474f] hover:bg-[#e0e3e5]"
                            }`}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
