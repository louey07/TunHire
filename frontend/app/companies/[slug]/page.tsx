"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import JobCard from "@/components/JobCard";
import { apiPublicGet } from "@/lib/api";
import {
  companyInitials,
  formatWebsiteDisplay,
  normalizeWebsiteUrl,
} from "@/lib/recruiter/company";
import type { Company, Job, PaginatedResponse } from "@/lib/types";

export default function PublicCompanyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const companyRes = await apiPublicGet<Company>(
          `/companies/slug/${slug}`,
        );
        if (!companyRes.success || !companyRes.data) {
          setCompany(null);
          setJobs([]);
          return;
        }
        const companyData = companyRes.data;
        setCompany(companyData);

        const jobsRes = await apiPublicGet<PaginatedResponse<Job>>(
          `/jobs?page=0&size=100`,
        );
        const allJobs = jobsRes.success ? jobsRes.data?.content || [] : [];
        setJobs(allJobs.filter((job) => job.companyId === companyData.id));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const websiteLabel = formatWebsiteDisplay(company?.website);
  const websiteHref = company?.website
    ? normalizeWebsiteUrl(company.website)
    : null;

  return (
    <div className="min-h-screen bg-[var(--surface)] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {loading ? (
          <div className="space-y-4">
            <div className="surface-card h-40 animate-pulse rounded-3xl" />
            <div className="surface-card h-24 animate-pulse rounded-3xl" />
          </div>
        ) : !company ? (
          <p className="text-sm text-[#93000a]">Entreprise introuvable.</p>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] p-8 text-[var(--on-primary)] editorial-shadow">
              <div className="flex flex-wrap items-center gap-6">
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
                <div>
                  <p className="label-uppercase text-[10px] font-bold text-white/70">
                    Entreprise
                  </p>
                  <h1 className="mt-1 font-headline text-4xl font-extrabold">
                    {company.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                    {company.location ? <span>{company.location}</span> : null}
                    {websiteLabel && websiteHref ? (
                      <a
                        href={websiteHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline-offset-2 hover:underline"
                      >
                        {websiteLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            {company.description ? (
              <p className="mt-8 text-sm leading-7 text-[var(--on-surface-variant)]">
                {company.description}
              </p>
            ) : null}

            <h2 className="mt-12 font-headline text-2xl font-bold text-[var(--primary)]">
              Offres ouvertes
            </h2>
            <div className="mt-6 space-y-4">
              {jobs.length === 0 ? (
                <div className="surface-section rounded-3xl p-8">
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Aucune offre publiée pour le moment.
                  </p>
                </div>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
            <Link
              href="/jobs"
              className="mt-8 inline-block text-sm font-semibold text-[var(--secondary)]"
            >
              Voir toutes les offres
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
