"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import JobForm, {
  jobFormValuesToRequest,
  jobToFormValues,
} from "@/components/recruiter/JobForm";
import { apiGet, apiPut } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import {
  RecruiterSetupNotice,
  useRequireActiveCompany,
} from "@/lib/hooks/useRequireActiveCompany";
import type { Job, JobFormValues } from "@/lib/types";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = Number(params.id);
  const { activeCompany, loading: companyLoading } = useRequireActiveCompany();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    requireRole("RECRUITER", router);
  }, [router]);

  useEffect(() => {
    if (!activeCompany || !jobId) return;
    void (async () => {
      setLoading(true);
      setMessage("");
      const res = await apiGet<Job>(`/jobs/${jobId}`);
      if (!res.success || !res.data) {
        setMessage(res.message || "Offre introuvable.");
        setJob(null);
        setLoading(false);
        return;
      }
      const data = res.data;
      if (data.companyId && data.companyId !== activeCompany.companyId) {
        router.replace("/dashboard/recruiter/jobs");
        return;
      }
      setJob(data);
      setLoading(false);
    })();
  }, [activeCompany, jobId, router]);

  async function saveJob(values: JobFormValues) {
    if (!activeCompany || !job) return;
    setSaving(true);
    setMessage("");
    const res = await apiPut(`/jobs/${job.id}`, jobFormValuesToRequest(values, activeCompany.companyId));
    if (res.success) {
      router.push("/dashboard/recruiter/jobs");
      return;
    }
    setMessage(res.message || "Erreur lors de la mise à jour.");
    setSaving(false);
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
        Modifier l&apos;offre
      </h1>

      {loading ? (
        <div className="mt-8 space-y-4">
          <div className="surface-card h-12 animate-pulse rounded-2xl" />
          <div className="surface-card h-64 animate-pulse rounded-3xl" />
        </div>
      ) : !job ? (
        <p className="mt-8 text-sm text-[#93000a]">{message}</p>
      ) : (
        <div className="mt-8">
          <JobForm
            initialValues={jobToFormValues(job)}
            submitLabel="Enregistrer"
            loading={saving}
            error={message}
            onSubmit={saveJob}
          />
        </div>
      )}
    </div>
  );
}
