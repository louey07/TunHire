"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CandidateContent from "@/components/CandidateContent";
import CompanyAboutSection from "@/components/candidate/CompanyAboutSection";
import ErrorBlock from "@/components/ErrorBlock";
import Navbar from "@/components/Navbar";
import { apiGet, apiPost, apiPublicGet } from "@/lib/api";
import { useClientUser } from "@/lib/hooks/useClientUser";
import { experienceLevelLabel, workModeLabel } from "@/lib/recruiter/jobs";
import type { Job } from "@/lib/types";

function formatSalary(value?: number | null) {
  if (value == null) return "Non précisé";
  return `${value} DT`;
}

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useClientUser();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const isCandidate = user?.role === "CANDIDATE";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await apiPublicGet<Job>(`/jobs/${id}`);
        setJob(res.success ? res.data || null : null);
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }

      if (user?.role === "CANDIDATE") {
        try {
          const applicationData = await apiGet<{ jobId?: number }[]>(
            `/applications?userId=${user.id}`,
          );
          if (!applicationData.success) return;
          setAlreadyApplied(
            (applicationData.data || []).some(
              (app) => Number(app.jobId) === Number(id),
            ),
          );
        } catch {
          /* ignore */
        }
      }
    }

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
      const res = await apiPost("/applications", { jobId: Number(id) });
      if (res.success) {
        setAlreadyApplied(true);
        setApplyMsg("Votre candidature a été envoyée avec succès.");
      } else {
        setApplyMsg(res.message || "Erreur lors de la candidature.");
      }
    } catch {
      setApplyMsg("Erreur de connexion.");
    } finally {
      setApplying(false);
    }
  }

  const body = (
    <div className={isCandidate ? "" : "mx-auto max-w-4xl px-4 py-10"}>
      {loading ? (
        <div className="surface-card rounded-3xl p-8 text-sm text-[var(--on-surface-variant)]">
          Chargement…
        </div>
      ) : !job ? (
        <ErrorBlock title="Offre introuvable" message="Cette offre n'existe plus ou a été retirée." />
      ) : (
        <div className="space-y-6">
          <Link
            href="/jobs"
            className="btn-secondary inline-flex rounded-full px-4 py-2 text-sm"
          >
            ← Retour aux offres
          </Link>

          <div className="surface-section p-8 editorial-shadow">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
                  Offre
                </p>
                <h1 className="mt-3 font-headline text-3xl font-extrabold text-[var(--primary)]">
                  {job.title}
                </h1>
                <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
                  {job.location}
                </p>
              </div>
              <span className="rounded-full bg-[var(--surface-container-low)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                {job.contractType}
              </span>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-card rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                  Mode de travail
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                  {workModeLabel(job.workMode)}
                </p>
              </div>
              <div className="surface-card rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                  Expérience
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                  {job.experienceLevel
                    ? experienceLevelLabel(job.experienceLevel)
                    : "Non précisée"}
                </p>
              </div>
              <div className="surface-card rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                  Salaire min
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                  {formatSalary(job.salaryMin)}
                </p>
              </div>
              <div className="surface-card rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
                  Salaire max
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                  {formatSalary(job.salaryMax)}
                </p>
              </div>
            </div>

            {job.companyName ? (
              <div className="mb-6">
                <CompanyAboutSection job={job} />
              </div>
            ) : null}

            <div className="surface-card rounded-3xl p-6">
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
                className="btn-primary rounded-2xl px-6 py-3 text-sm disabled:opacity-50"
              >
                {alreadyApplied
                  ? "Candidature déjà envoyée"
                  : applying
                    ? "Envoi en cours…"
                    : "Postuler à cette offre"}
              </button>
              {!user ? (
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[var(--secondary)] hover:underline"
                >
                  Connectez-vous pour postuler
                </Link>
              ) : null}
            </div>

            {applyMsg ? (
              <p className="mt-4 text-sm text-[var(--on-surface-variant)]">
                {applyMsg}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  if (isCandidate) {
    return <CandidateContent>{body}</CandidateContent>;
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <Navbar />
      {body}
    </div>
  );
}
