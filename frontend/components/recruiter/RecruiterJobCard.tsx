"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getJobStatusUi, workModeLabel } from "@/lib/status/jobs";
import type { JobStatus, RecruiterJobSummary } from "@/lib/types";

type RecruiterJobCardProps = {
  job: RecruiterJobSummary;
  applicantCount?: number;
  busy?: boolean;
  onPublish: () => void;
  onClose: () => void;
  onReopen: () => void;
  onDelete: () => void;
};

export default function RecruiterJobCard({
  job,
  applicantCount = 0,
  busy,
  onPublish,
  onClose,
  onReopen,
  onDelete,
}: RecruiterJobCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const status = String(job.status) as JobStatus;
  const statusUi = getJobStatusUi(status);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <article className="surface-section relative flex flex-col overflow-visible editorial-shadow">
      <div className="flex-1 px-5 py-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusUi.tone}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusUi.dot}`} />
            {statusUi.label}
          </span>
          {applicantCount > 0 ? (
            <Link
              href={`/dashboard/recruiter/candidates?jobId=${job.id}`}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-container-high)] px-2.5 py-1 text-xs text-[var(--on-surface-variant)] hover:bg-[var(--secondary)]/10 hover:text-[var(--secondary)]"
            >
              {applicantCount} candidat{applicantCount !== 1 ? "s" : ""}
            </Link>
          ) : null}
        </div>

        <Link
          href={`/dashboard/recruiter/jobs/${job.id}/edit`}
          className="font-headline text-lg font-bold text-[var(--primary)] hover:text-[var(--secondary)]"
        >
          {job.title}
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--on-surface-variant)]">
          <span>{job.location}</span>
          {job.workMode ? (
            <span>· {workModeLabel(job.workMode)}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-low)] px-4 py-3">
        {status === "DRAFT" ? (
          <button
            type="button"
            disabled={busy}
            onClick={onPublish}
            className="btn-primary rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-60"
          >
            Publier
          </button>
        ) : null}
        {status === "OPEN" ? (
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-full border border-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)] bg-white px-4 py-2 text-xs font-semibold text-[var(--primary)] disabled:opacity-60"
          >
            Fermer
          </button>
        ) : null}
        {status === "CLOSED" ? (
          <button
            type="button"
            disabled={busy}
            onClick={onReopen}
            className="rounded-full border border-[color-mix(in_srgb,var(--outline-variant)_20%,transparent)] bg-white px-4 py-2 text-xs font-semibold text-[var(--primary)] disabled:opacity-60"
          >
            Rouvrir
          </button>
        ) : null}

        <Link
          href={`/dashboard/recruiter/jobs/${job.id}/edit`}
          className="rounded-full border border-[color-mix(in_srgb,var(--secondary)_35%,transparent)] bg-white px-4 py-2 text-xs font-semibold text-[var(--primary)] transition hover:border-[var(--secondary)] hover:bg-[var(--secondary)]/5"
        >
          Modifier
        </Link>

        <div ref={menuRef} className="relative ml-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Plus d'actions"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-base leading-none transition ${
              menuOpen
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
                : "border-[color-mix(in_srgb,var(--outline-variant)_25%,transparent)] bg-white text-[var(--primary)] hover:border-[color-mix(in_srgb,var(--secondary)_40%,transparent)] hover:bg-[var(--surface-container-high)]"
            }`}
          >
            ⋯
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute bottom-full right-0 z-50 mb-2 w-52 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--outline-variant)_18%,transparent)] bg-[var(--surface-container-lowest)] py-1.5 shadow-[0_12px_32px_rgba(0,30,64,0.16)]"
            >
              <Link
                href={`/dashboard/recruiter/jobs/${job.id}/edit`}
                role="menuitem"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--surface-container-low)]"
                onClick={() => setMenuOpen(false)}
              >
                Modifier l&apos;offre
              </Link>
              <Link
                href={`/dashboard/recruiter/candidates?jobId=${job.id}`}
                role="menuitem"
                className="flex items-center px-4 py-2.5 text-sm text-[var(--on-surface)] transition hover:bg-[var(--surface-container-low)]"
                onClick={() => setMenuOpen(false)}
              >
                Voir candidatures
              </Link>
              <Link
                href={`/dashboard/recruiter/candidates?jobId=${job.id}&tab=ranking`}
                role="menuitem"
                className="flex items-center px-4 py-2.5 text-sm text-[var(--on-surface)] transition hover:bg-[var(--surface-container-low)]"
                onClick={() => setMenuOpen(false)}
              >
                Classement IA
              </Link>
              <Link
                href={`/jobs/${job.id}`}
                role="menuitem"
                className="flex items-center px-4 py-2.5 text-sm text-[var(--on-surface)] transition hover:bg-[var(--surface-container-low)]"
                onClick={() => setMenuOpen(false)}
              >
                Aperçu public
              </Link>
              <div className="my-1 border-t border-[color-mix(in_srgb,var(--outline-variant)_15%,transparent)]" />
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-[#93000a] transition hover:bg-[#93000a]/8 disabled:opacity-60"
              >
                Supprimer
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
