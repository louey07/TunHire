"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CandidateCvPanel from "@/components/recruiter/CandidateCvPanel";
import CandidateDecisionPanel from "@/components/recruiter/CandidateDecisionPanel";
import CandidateInsightsPanel from "@/components/recruiter/CandidateInsightsPanel";
import CandidateReviewHeader from "@/components/recruiter/CandidateReviewHeader";
import { apiGet, apiPatchQuery } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import {
  RecruiterSetupNotice,
  useRequireActiveCompany,
} from "@/lib/hooks/useRequireActiveCompany";
import {
  type ApplicationDetail,
} from "@/lib/recruiter/candidates";
import { isNumericId } from "@/lib/resume";
import type {
  ApplicationStatus,
  CandidateProfile,
  Job,
  RankedApplicationRaw,
} from "@/lib/types";

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const { activeCompany, loading: companyLoading } = useRequireActiveCompany();

  const [application, setApplication] = useState<ApplicationDetail | null>(
    null,
  );
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [rankedMeta, setRankedMeta] = useState<{
    score: number | null;
    level: string | null;
    matchedSkills: string[] | null;
    gaps: string[] | null;
    summary: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    requireRole("RECRUITER", router);
  }, [router]);

  useEffect(() => {
    if (!applicationId || !isNumericId(applicationId)) return;
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const appRes = await apiGet<ApplicationDetail>(
          `/applications/${applicationId}`,
        );
        if (!appRes.success || !appRes.data) {
          setError(appRes.message || "Candidature introuvable.");
          setApplication(null);
          setLoading(false);
          return;
        }

        const appData = appRes.data;
        setApplication(appData);

        const [profileRes, rankedRes, jobRes] = await Promise.all([
          apiGet<CandidateProfile>(`/candidates/${appData.userId}`),
          appData.jobId
            ? apiGet<RankedApplicationRaw[]>(
                `/applications/job/${appData.jobId}/ranked`,
              )
            : Promise.resolve(null),
          appData.jobId
            ? apiGet<Job>(`/jobs/${appData.jobId}`)
            : Promise.resolve(null),
        ]);

        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        }

        if (jobRes?.success && jobRes.data?.title) {
          setJobTitle(jobRes.data.title);
        }

        if (rankedRes?.success && rankedRes.data) {
          const match = rankedRes.data.find(
            (entry) => entry.applicationId === appData.id,
          );
          if (match) {
            setRankedMeta({
              score: match.score,
              level: match.level,
              matchedSkills: match.matchedSkills,
              gaps: match.gaps ?? null,
              summary: match.summary ?? null,
            });
          }
        }
      } catch {
        setError("Erreur de connexion.");
      } finally {
        setLoading(false);
      }
    })();
  }, [applicationId]);

  async function updateStatus(nextStatus: ApplicationStatus) {
    if (!application) return;
    setUpdating(true);
    const res = await apiPatchQuery(`/applications/${application.id}/status`, {
      status: nextStatus,
    });
    if (res.success) {
      setApplication({ ...application, status: nextStatus });
    } else {
      setError(res.message || "Impossible de mettre à jour le statut.");
    }
    setUpdating(false);
  }

  if (companyLoading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-10 lg:px-8 xl:px-10">
        <div className="surface-card h-40 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!activeCompany) {
    return <RecruiterSetupNotice />;
  }

  if (!applicationId || !isNumericId(applicationId)) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-10 lg:px-8 xl:px-10">
        <p className="text-sm text-[#93000a]">
          Lien candidat invalide. Utilisez « Voir le profil » depuis la liste des
          candidats.
        </p>
        <Link
          href="/dashboard/recruiter/candidates"
          className="mt-4 inline-block text-sm font-semibold text-[var(--secondary)]"
        >
          ← Retour aux candidats
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-10 lg:px-8 xl:px-10">
        <div className="surface-card h-56 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-10 lg:px-8 xl:px-10">
        <p className="text-sm text-[#93000a]">{error || "Candidature introuvable."}</p>
        <Link
          href="/dashboard/recruiter/candidates"
          className="mt-4 inline-block text-sm font-semibold text-[var(--secondary)]"
        >
          ← Retour aux candidats
        </Link>
      </div>
    );
  }

  const status = application.status as ApplicationStatus;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8 xl:px-10">
      <CandidateReviewHeader
        displayName={[application.candidateFirstName, application.candidateLastName]
          .filter(Boolean)
          .join(" ")
          .trim() || "Candidat"}
        status={status}
        appliedAt={application.createdAt}
        jobTitle={jobTitle}
        score={rankedMeta?.score ?? null}
        level={rankedMeta?.level ?? null}
      />

      {error ? <p className="mt-4 text-sm text-[#93000a]">{error}</p> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)] xl:gap-8">
        <CandidateCvPanel
          candidateUserId={application.userId}
          fileName={profile?.resumeFileName}
          hasResume={profile?.hasResume}
          contentType={profile?.resumeContentType}
        />

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <CandidateDecisionPanel
            currentStatus={status}
            updating={updating}
            onStatusChange={(next) => void updateStatus(next)}
            candidateUserId={application.userId}
          />
          <CandidateInsightsPanel
            profile={profile}
            matchedSkills={rankedMeta?.matchedSkills ?? null}
            gaps={rankedMeta?.gaps ?? null}
            summary={rankedMeta?.summary ?? null}
          />
        </aside>
      </div>
    </div>
  );
}
