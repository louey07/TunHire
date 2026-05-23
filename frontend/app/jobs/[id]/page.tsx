"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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

function formatSalary(value?: number | null) {
  if (value == null) return "Non precise";
  return `${value} DT`;
}

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [user] = useState<User | null>(() => getUser());
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await apiPublicGet(`/jobs/${id}`);
        if (data?.success) {
          setJob(data.data);
        } else {
          setJob(null);
        }
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }

      if (user?.role === "CANDIDATE") {
        try {
          const applicationData = await apiGet(
            `/applications?userId=${user.id}`,
          );
          if (!applicationData?.success) return;
          const applications = (applicationData.data ||
            []) as ApplicationSummary[];
          setAlreadyApplied(
            applications.some((app) => Number(app.jobId) === Number(id)),
          );
        } catch {}
      }
    };

    void loadData();
  }, [id, user]);

  async function applyToJob() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "CANDIDATE") {
      setApplyMsg("Seuls les candidats peuvent postuler à une offre.");
      return;
    }
    if (alreadyApplied) {
      setApplyMsg("Vous avez déjà postulé à cette offre.");
      return;
    }

    setApplying(true);
    setApplyMsg("");
    try {
      const data = await apiPost("/applications", { jobId: Number(id) });
      if (data?.success) {
        setAlreadyApplied(true);
        setApplyMsg("Votre candidature a été envoyée avec succès.");
      } else {
        setApplyMsg(data?.message || "Erreur lors de la candidature.");
      }
    } catch {
      setApplyMsg("Erreur de connexion.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {loading ? (
          <div className="rounded-3xl bg-[var(--surface-container-low)] p-8 text-sm text-[var(--on-surface-variant)]">
            Chargement...
          </div>
        ) : !job ? (
          <div className="rounded-3xl bg-[#ffdad6] p-8 text-sm text-[#93000a]">
            Offre introuvable.
          </div>
        ) : (
          <div className="space-y-6">
            <Link
              href="/jobs"
              className="inline-flex rounded-full bg-[var(--surface-container-low)] px-4 py-2 text-sm font-semibold text-[var(--primary)]"
            >
              Retour aux offres
            </Link>

            <div className="rounded-[2.5rem] bg-[var(--surface-container-lowest)] p-8 editorial-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
                    Opportunity
                  </p>
                  <h1 className="mt-3 text-3xl font-headline font-extrabold text-[var(--primary)]">
                    {job.title}
                  </h1>
                  <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
                    {job.companyName
                      ? `${job.companyName} · ${job.location}`
                      : job.location}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--surface-container-low)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                  {job.contractType}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                    Experience
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                    {job.experienceLevel || "Non precisee"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                    Salaire min
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                    {formatSalary(job.salaryMin)}
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                    Salaire max
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                    {formatSalary(job.salaryMax)}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-[var(--surface-container-low)] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                  Description
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--on-surface-variant)]">
                  {job.description}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => void applyToJob()}
                  disabled={applying || alreadyApplied}
                  className="rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--on-primary)] shadow-lg disabled:opacity-50"
                >
                  {alreadyApplied
                    ? "Candidature deja envoyee"
                    : applying
                      ? "Envoi en cours..."
                      : "Postuler a cette offre"}
                </button>
                {!user && (
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-[var(--secondary)] hover:underline"
                  >
                    Connectez-vous pour postuler
                  </Link>
                )}
              </div>

              {applyMsg && (
                <div
                  className={`mt-4 rounded-2xl px-4 py-3 text-sm ${applyMsg.includes("succes") || applyMsg.includes("envoyee") ? "bg-[color-mix(in_srgb,var(--tertiary)_30%,white)] text-[var(--primary)]" : "bg-[#ffdad6] text-[#93000a]"}`}
                >
                  {applyMsg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
