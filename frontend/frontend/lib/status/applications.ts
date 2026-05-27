import type { Application, ApplicationStatus } from "@/lib/types";

export type ExtendedApplicationStatus =
  | ApplicationStatus
  | "INTERVIEW"
  | "HIRED";

export type ApplicationStatusUi = {
  label: string;
  tone: string;
  pipelineBg: string;
  pipelineText: string;
  description: string;
};

export const APPLICATION_STATUS_UI: Record<
  ExtendedApplicationStatus,
  ApplicationStatusUi
> = {
  SUBMITTED: {
    label: "Soumise",
    tone: "bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)]",
    pipelineBg: "bg-[var(--surface-container-highest)]",
    pipelineText: "text-[var(--on-surface-variant)]",
    description: "Votre candidature a bien été reçue.",
  },
  IN_REVIEW: {
    label: "En examen",
    tone: "bg-[#001e40]/10 text-[#001e40]",
    pipelineBg: "bg-[#001e40]/8",
    pipelineText: "text-[#001e40]",
    description: "Le recruteur examine votre profil.",
  },
  SHORTLISTED: {
    label: "Présélectionné",
    tone: "bg-[var(--secondary)]/10 text-[var(--secondary)]",
    pipelineBg: "bg-[var(--secondary)]/10",
    pipelineText: "text-[var(--secondary)]",
    description: "Vous faites partie des profils retenus.",
  },
  REJECTED: {
    label: "Refusé",
    tone: "bg-[#93000a]/10 text-[#93000a]",
    pipelineBg: "bg-[#93000a]/8",
    pipelineText: "text-[#93000a]",
    description: "Cette candidature n'a pas été retenue.",
  },
  INTERVIEW: {
    label: "Entretien",
    tone: "bg-[color-mix(in_srgb,var(--secondary)_18%,white)] text-[var(--secondary)]",
    pipelineBg: "bg-[color-mix(in_srgb,var(--secondary)_12%,white)]",
    pipelineText: "text-[var(--secondary)]",
    description: "Un entretien est prévu ou en cours.",
  },
  HIRED: {
    label: "Embauché",
    tone: "bg-[color-mix(in_srgb,var(--tertiary)_40%,white)] text-[var(--primary)]",
    pipelineBg: "bg-[color-mix(in_srgb,var(--tertiary)_30%,white)]",
    pipelineText: "text-[var(--primary)]",
    description: "Félicitations, vous avez été retenu.",
  },
};

export const PIPELINE_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "IN_REVIEW",
  "SHORTLISTED",
  "REJECTED",
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: APPLICATION_STATUS_UI.SUBMITTED.label,
  IN_REVIEW: APPLICATION_STATUS_UI.IN_REVIEW.label,
  SHORTLISTED: APPLICATION_STATUS_UI.SHORTLISTED.label,
  REJECTED: APPLICATION_STATUS_UI.REJECTED.label,
};

export const APPLICATION_STATUS_TONES: Record<ApplicationStatus, string> = {
  SUBMITTED: APPLICATION_STATUS_UI.SUBMITTED.tone,
  IN_REVIEW: APPLICATION_STATUS_UI.IN_REVIEW.tone,
  SHORTLISTED: APPLICATION_STATUS_UI.SHORTLISTED.tone,
  REJECTED: APPLICATION_STATUS_UI.REJECTED.tone,
};

export const RECRUITER_STATUS_ACTIONS: ApplicationStatus[] = [
  "IN_REVIEW",
  "SHORTLISTED",
  "REJECTED",
];

export function getApplicationStatusUi(
  status?: string | null,
): ApplicationStatusUi {
  const key = (status || "IN_REVIEW").toUpperCase() as ExtendedApplicationStatus;
  return APPLICATION_STATUS_UI[key] ?? APPLICATION_STATUS_UI.IN_REVIEW;
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (
    value === "SUBMITTED" ||
    value === "IN_REVIEW" ||
    value === "SHORTLISTED" ||
    value === "REJECTED"
  );
}

export function countByStatus<T extends { status?: string }>(
  items: T[],
): Record<ApplicationStatus, number> {
  return items.reduce(
    (acc, item) => {
      const status = String(item.status || "SUBMITTED").toUpperCase();
      if (isApplicationStatus(status)) acc[status] += 1;
      return acc;
    },
    { SUBMITTED: 0, IN_REVIEW: 0, SHORTLISTED: 0, REJECTED: 0 },
  );
}

export function sortByCreatedAtDesc<T extends { createdAt?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function formatApplicationDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

export function formatRelativeDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Il y a ${weeks} sem.`;
  }
  return formatApplicationDate(value);
}

export function filterApplicationsByStatus<T extends Application>(
  items: T[],
  statusFilter: ApplicationStatus | "ALL",
): T[] {
  if (statusFilter === "ALL") return items;
  return items.filter(
    (item) => String(item.status || "SUBMITTED").toUpperCase() === statusFilter,
  );
}
