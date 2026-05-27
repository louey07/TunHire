"use client";

import Link from "next/link";
import ApplicationCard from "@/components/candidate/ApplicationCard";
import ApplicationFunnel from "@/components/candidate/dashboard/ApplicationFunnel";
import ProfileChecklist from "@/components/candidate/dashboard/ProfileChecklist";
import CandidateContent from "@/components/CandidateContent";
import StatCard from "@/components/ui/StatCard";
import EmptyStatePanel from "@/components/ui/EmptyStatePanel";
import {
  getTimeOfDayGreeting,
  useCandidateDashboard,
} from "@/lib/hooks/useCandidateDashboard";

export default function CandidateDashboardPage() {
  const {
    firstName,
    loading,
    statusCounts,
    totalApplications,
    recentApplications,
    jobsById,
    deletingId,
    deleteApplication,
    profileChecklist,
    checklistProgress,
    profileScore,
    skills,
  } = useCandidateDashboard();

  const greeting = getTimeOfDayGreeting();

  async function handleDeleteApplication(applicationId: number) {
    const app = recentApplications.find((item) => item.id === applicationId);
    const jobTitle = app?.jobId ? jobsById[app.jobId]?.title : undefined;
    const confirmed = window.confirm(
      jobTitle
        ? `Retirer votre candidature pour « ${jobTitle} » ?`
        : "Retirer cette candidature ?",
    );
    if (!confirmed) return;
    await deleteApplication(applicationId);
  }

  return (
    <CandidateContent>
      <div className="space-y-8">
        <header>
          <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
            Tableau de bord
          </p>
          <h1 className="mt-2 font-headline text-4xl font-extrabold text-[var(--primary)]">
            {greeting}, {firstName || "Candidat"}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--on-surface-variant)]">
            {totalApplications > 0
              ? `Vous avez ${totalApplications} candidature${totalApplications !== 1 ? "s" : ""} en cours.`
              : "Complétez votre profil et explorez les offres pour démarrer."}
          </p>
        </header>

        {loading ? (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="surface-card h-28 animate-pulse rounded-3xl"
                />
              ))}
            </div>
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-5">
                <div className="surface-card h-48 animate-pulse rounded-3xl" />
                <div className="surface-card h-32 animate-pulse rounded-3xl" />
              </div>
              <div className="lg:col-span-7">
                <div className="surface-card h-64 animate-pulse rounded-3xl" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Candidatures"
                value={totalApplications}
                href="/dashboard/candidate/applications"
              />
              <StatCard
                label="En examen"
                value={statusCounts.IN_REVIEW}
                tone="text-[#001e40]"
                href="/dashboard/candidate/applications"
              />
              <StatCard
                label="Présélectionné"
                value={statusCounts.SHORTLISTED}
                tone="text-[var(--secondary)]"
                href="/dashboard/candidate/applications"
              />
              <StatCard
                label="Compétences"
                value={skills.length}
                href="/dashboard/candidate/profile"
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-5">
                <ProfileChecklist
                  checklist={profileChecklist}
                  progress={checklistProgress}
                  profileScore={profileScore}
                />
                {totalApplications > 0 ? (
                  <ApplicationFunnel counts={statusCounts} />
                ) : null}
                <section className="surface-section p-5 editorial-shadow">
                  <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
                    Actions rapides
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href="/jobs"
                      className="rounded-2xl bg-[var(--surface-container-high)] px-4 py-3 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--surface-container-highest)]"
                    >
                      Parcourir les offres
                    </Link>
                    <Link
                      href="/dashboard/candidate/profile"
                      className="rounded-2xl bg-[var(--surface-container-high)] px-4 py-3 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--surface-container-highest)]"
                    >
                      Compléter mon profil
                    </Link>
                    <Link
                      href="/dashboard/candidate/applications"
                      className="rounded-2xl bg-[var(--surface-container-high)] px-4 py-3 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--surface-container-highest)]"
                    >
                      Voir mes candidatures
                    </Link>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-7">
                <section className="surface-section p-6 editorial-shadow">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
                        Activité récente
                      </p>
                      <h2 className="mt-1 font-headline text-xl font-bold text-[var(--primary)]">
                        Candidatures récentes
                      </h2>
                    </div>
                    {totalApplications > 0 ? (
                      <Link
                        href="/dashboard/candidate/applications"
                        className="text-sm font-semibold text-[var(--secondary)] hover:underline"
                      >
                        Tout voir
                      </Link>
                    ) : null}
                  </div>

                  {totalApplications === 0 ? (
                    <EmptyStatePanel
                      title="Aucune candidature"
                      description="Explorez les offres disponibles et postulez en quelques clics."
                      action={
                        <Link
                          href="/jobs"
                          className="btn-primary rounded-full px-5 py-2 text-sm"
                        >
                          Trouver un emploi
                        </Link>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentApplications.map((app) => (
                        <ApplicationCard
                          key={app.id}
                          application={app}
                          job={app.jobId ? jobsById[app.jobId] : undefined}
                          compact
                          onDelete={handleDeleteApplication}
                          deleting={deletingId === app.id}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </CandidateContent>
  );
}
