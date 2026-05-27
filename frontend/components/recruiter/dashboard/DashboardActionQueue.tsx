"use client";

import Link from "next/link";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  formatApplicationDate,
  formatCandidateName,
} from "@/lib/recruiter/candidates";
import type { DashboardApplicationItem } from "@/lib/types";

type DashboardActionQueueProps = {
  items: DashboardApplicationItem[];
};

export default function DashboardActionQueue({
  items,
}: DashboardActionQueueProps) {
  return (
    <section className="surface-section p-6 editorial-shadow">
      <h2 className="font-headline text-xl font-bold text-[var(--primary)]">
        À traiter
      </h2>
      <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
        Candidatures soumises ou en cours d&apos;examen.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--on-surface-variant)]">
          Aucune candidature en attente pour le moment.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--surface-container-low)] p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--primary)]">
                  {formatCandidateName(
                    item.candidateFirstName,
                    item.candidateLastName,
                  )}
                </p>
                <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                  {item.jobTitle} · {formatApplicationDate(item.createdAt)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${APPLICATION_STATUS_TONES[item.status]}`}
              >
                {APPLICATION_STATUS_LABELS[item.status]}
              </span>
              <Link
                href={`/dashboard/recruiter/candidates/${item.id}`}
                className="text-sm font-semibold text-[var(--secondary)] hover:underline"
              >
                Voir le profil
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
