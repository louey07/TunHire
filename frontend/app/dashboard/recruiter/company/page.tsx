"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import CompanyProfileForm from "@/components/recruiter/CompanyProfileForm";
import UserAccountNameForm from "@/components/UserAccountNameForm";
import { roleLabel } from "@/components/recruiter/CompanyPicker";
import { apiGet, apiPut } from "@/lib/api";
import { useRecruiterCompany } from "@/lib/context/RecruiterCompanyContext";
import {
  RecruiterSetupNotice,
  useRequireActiveCompany,
} from "@/lib/hooks/useRequireActiveCompany";
import {
  companyInitials,
  companyToFormValues,
  formatWebsiteDisplay,
  formValuesToUpdatePayload,
  normalizeWebsiteUrl,
} from "@/lib/recruiter/company";
import type {
  Company,
  CompanyDashboardResponse,
  CompanyFormValues,
} from "@/lib/types";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="surface-card rounded-2xl p-5">
      <p className="label-uppercase text-[10px] font-bold text-[var(--on-surface-variant)]">
        {label}
      </p>
      <p className="mt-2 font-headline text-3xl font-extrabold text-[var(--primary)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[var(--on-surface-variant)]">{hint}</p>
      ) : null}
    </div>
  );
}

export default function RecruiterCompanyPage() {
  const { refresh } = useRecruiterCompany();
  const { activeCompany, loading: companyLoading, isAdmin } =
    useRequireActiveCompany();
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<{
    totalJobs: number;
    openJobs: number;
    applications: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadCompany = useCallback(async () => {
    if (!activeCompany) return;
    setLoading(true);
    setError("");
    try {
      const [companyRes, dashboardRes] = await Promise.all([
        apiGet<Company>(`/companies/${activeCompany.companyId}`),
        apiGet<CompanyDashboardResponse>(
          `/companies/${activeCompany.companyId}/dashboard`,
        ),
      ]);

      if (!companyRes.success || !companyRes.data) {
        setCompany(null);
        setStats(null);
        setError(companyRes.message || "Impossible de charger l'entreprise.");
        return;
      }

      setCompany(companyRes.data);

      if (dashboardRes.success && dashboardRes.data) {
        const jobs = dashboardRes.data.jobs || [];
        setStats({
          totalJobs: jobs.length,
          openJobs: jobs.filter((job) => job.status === "OPEN").length,
          applications: dashboardRes.data.applications?.length ?? 0,
        });
      } else {
        setStats(null);
      }
    } catch {
      setCompany(null);
      setStats(null);
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }, [activeCompany]);

  useEffect(() => {
    void loadCompany();
  }, [loadCompany]);

  const formInitialValues = useMemo(
    () => (company ? companyToFormValues(company) : undefined),
    [company],
  );

  async function saveCompany(values: CompanyFormValues) {
    if (!company || !isAdmin) return;
    setSaving(true);
    setSuccessMessage("");
    setError("");
    const payload = formValuesToUpdatePayload(values);
    if (payload.website) {
      payload.website = normalizeWebsiteUrl(payload.website);
    }
    const res = await apiPut<Company>(`/companies/${company.id}`, payload);
    if (res.success && res.data) {
      setCompany(res.data);
      setSuccessMessage("Profil entreprise mis à jour.");
      await refresh();
    } else {
      setError(res.message || "Erreur lors de la mise à jour.");
    }
    setSaving(false);
  }

  if (companyLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="surface-card h-48 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!activeCompany) {
    return <RecruiterSetupNotice />;
  }

  const websiteLabel = formatWebsiteDisplay(company?.website);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
            Entreprise
          </p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold text-[var(--primary)]">
            Profil entreprise
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--on-surface-variant)]">
            {isAdmin
              ? "Mettez à jour les informations visibles sur votre page publique et dans vos offres."
              : "Consultation seule — seuls les admins peuvent modifier le profil."}
          </p>
        </div>
        <span className="rounded-full bg-[var(--surface-container-high)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--on-surface-variant)]">
          {roleLabel(activeCompany.role)}
        </span>
      </div>

      <UserAccountNameForm className="mt-8" compact />

      {loading ? (
        <div className="mt-8 space-y-4">
          <div className="surface-card h-40 animate-pulse rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="surface-card h-28 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        </div>
      ) : !company ? (
        <p className="mt-8 text-sm text-[#93000a]">{error}</p>
      ) : (
        <>
          <section className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] p-8 text-[var(--on-primary)] editorial-shadow">
            <div className="relative z-10 flex flex-wrap items-center gap-6">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logoUrl}
                  alt=""
                  className="h-20 w-20 rounded-2xl bg-white/10 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 font-headline text-2xl font-bold">
                  {companyInitials(company.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="label-uppercase text-[10px] font-bold text-white/70">
                  Page publique
                </p>
                <h2 className="mt-1 font-headline text-3xl font-extrabold">
                  {company.name}
                </h2>
                <p className="mt-2 text-sm text-white/80">
                  {[company.location, websiteLabel].filter(Boolean).join(" · ") ||
                    "Complétez votre profil pour attirer les candidats."}
                </p>
              </div>
            </div>
          </section>

          {stats ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Offres publiées"
                value={String(stats.openJobs)}
                hint={`${stats.totalJobs} offre(s) au total`}
              />
              <StatCard
                label="Candidatures"
                value={String(stats.applications)}
                hint="Toutes offres confondues"
              />
              <StatCard
                label="Rôle"
                value={roleLabel(activeCompany.role)}
                hint={
                  isAdmin
                    ? "Gestion équipe disponible"
                    : "Accès membre recruteur"
                }
              />
            </div>
          ) : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div>
              <p className="label-uppercase mb-4 text-[10px] font-bold text-[var(--secondary)]">
                {isAdmin ? "Modifier le profil" : "Informations"}
              </p>
              <CompanyProfileForm
                initialValues={formInitialValues}
                readOnly={!isAdmin}
                loading={saving}
                error={error}
                successMessage={successMessage}
                onSubmit={isAdmin ? saveCompany : undefined}
              />
            </div>

            <aside className="space-y-6">
              <div className="surface-section p-6 editorial-shadow">
                <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
                  Aperçu candidat
                </p>
                <h3 className="mt-2 font-headline text-xl font-bold text-[var(--primary)]">
                  {company.name}
                </h3>
                {company.location ? (
                  <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                    {company.location}
                  </p>
                ) : null}
                {company.description ? (
                  <p className="mt-4 text-sm leading-7 text-[var(--on-surface-variant)]">
                    {company.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm italic text-[var(--on-surface-variant)]">
                    Ajoutez une description pour présenter votre culture et vos
                    valeurs.
                  </p>
                )}
                {websiteLabel ? (
                  <p className="mt-4 text-sm font-semibold text-[var(--secondary)]">
                    {websiteLabel}
                  </p>
                ) : null}
              </div>

              <div className="surface-section space-y-3 p-6">
                <p className="label-uppercase text-[10px] font-bold text-[var(--on-surface-variant)]">
                  Raccourcis
                </p>
                <Link
                  href="/dashboard/recruiter/jobs"
                  className="block rounded-2xl bg-[var(--surface-container-low)] px-4 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--surface-container-high)]"
                >
                  Gérer les offres
                </Link>
                <Link
                  href="/dashboard/recruiter/candidates"
                  className="block rounded-2xl bg-[var(--surface-container-low)] px-4 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--surface-container-high)]"
                >
                  Voir les candidatures
                </Link>
                {isAdmin ? (
                  <Link
                    href="/dashboard/recruiter/team"
                    className="block rounded-2xl bg-[var(--surface-container-low)] px-4 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--surface-container-high)]"
                  >
                    Gérer l&apos;équipe
                  </Link>
                ) : null}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
