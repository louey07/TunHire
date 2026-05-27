"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import JobForm, { jobFormValuesToRequest } from "@/components/recruiter/JobForm";
import { apiPatchQuery, apiPost } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import {
  RecruiterSetupNotice,
  useRequireActiveCompany,
} from "@/lib/hooks/useRequireActiveCompany";
import type { JobFormValues } from "@/lib/types";

export default function NewJobPage() {
  const router = useRouter();
  const { activeCompany, loading: companyLoading } = useRequireActiveCompany();
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    requireRole("RECRUITER", router);
  }, [router]);

  async function createJob(values: JobFormValues, publish: boolean) {
    if (!activeCompany) {
      setMessage("Sélectionnez ou créez une entreprise d'abord.");
      return;
    }
    setPosting(true);
    setMessage("");
    try {
      const res = await apiPost<{ id: number }>(
        "/jobs",
        jobFormValuesToRequest(values, activeCompany.companyId),
      );
      if (res.success && res.data?.id) {
        if (publish) {
          await apiPatchQuery(`/jobs/${res.data.id}/status`, {
            status: "OPEN",
          });
        }
        router.push("/dashboard/recruiter/jobs");
        return;
      }
      setMessage(res.message || "Erreur lors de la création.");
    } catch {
      setMessage("Erreur de connexion.");
    } finally {
      setPosting(false);
    }
  }

  if (companyLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="surface-card h-40 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!activeCompany) {
    return <RecruiterSetupNotice />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard/recruiter/jobs"
        className="text-sm font-semibold text-[var(--secondary)]"
      >
        ← Retour aux offres
      </Link>
      <h1 className="mt-4 font-headline text-4xl font-extrabold text-[var(--primary)]">
        Nouvelle offre
      </h1>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        Les offres sont créées en brouillon par défaut. Publiez-les lorsque vous
        êtes prêt à recevoir des candidatures.
      </p>
      <div className="mt-8">
        <JobForm
          submitLabel="Publier l'offre"
          secondaryLabel="Enregistrer en brouillon"
          loading={posting}
          error={message}
          onSubmit={(values) => createJob(values, true)}
          onSecondarySubmit={(values) => createJob(values, false)}
        />
      </div>
    </div>
  );
}
