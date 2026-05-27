"use client";

import type { JobStats, PipelineStats } from "@/lib/recruiter/dashboard";

type DashboardKpiCardsProps = {
  jobStats: JobStats;
  pipelineStats: PipelineStats;
};

const cards = [
  {
    key: "open",
    label: "Offres publiées",
    getValue: (j: JobStats) => j.open,
    tone: "text-[var(--primary)]",
  },
  {
    key: "draft",
    label: "Brouillons",
    getValue: (j: JobStats) => j.draft,
    tone: "text-[var(--on-surface-variant)]",
  },
  {
    key: "submitted",
    label: "Nouvelles candidatures",
    getValue: (_: JobStats, p: PipelineStats) => p.submitted,
    tone: "text-[var(--secondary)]",
  },
  {
    key: "inReview",
    label: "En examen",
    getValue: (_: JobStats, p: PipelineStats) => p.inReview,
    tone: "text-[#001e40]",
  },
] as const;

export default function DashboardKpiCards({
  jobStats,
  pipelineStats,
}: DashboardKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="surface-section p-5 editorial-shadow"
        >
          <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
            {card.label}
          </p>
          <p className={`mt-2 font-headline text-3xl font-extrabold ${card.tone}`}>
            {card.getValue(jobStats, pipelineStats)}
          </p>
        </div>
      ))}
    </div>
  );
}
