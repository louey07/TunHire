import type { ApplicationStatus, EnrichedRankedApplication, RankedApplicationRaw } from "@/lib/types";
import { apiGet } from "@/lib/api";

export type ApplicationDetail = {
  id: number;
  jobId: number;
  userId: number;
  candidateFirstName: string;
  candidateLastName: string;
  resumeUrl: string | null;
  status: ApplicationStatus;
  createdAt: string;
};

export {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  RECRUITER_STATUS_ACTIONS,
  formatApplicationDate,
} from "@/lib/status/applications";

export function formatCandidateName(
  firstName?: string,
  lastName?: string,
  fallback = "Candidat",
) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
}

export async function enrichRankedApplications(
  ranked: RankedApplicationRaw[],
): Promise<EnrichedRankedApplication[]> {
  return Promise.all(
    ranked.map(async (entry) => {
      const res = await apiGet<ApplicationDetail>(
        `/applications/${entry.applicationId}`,
      );
      if (!res.success || !res.data) {
        return { ...entry };
      }
      return {
        ...entry,
        candidateFirstName: res.data.candidateFirstName,
        candidateLastName: res.data.candidateLastName,
        resumeUrl: res.data.resumeUrl,
      };
    }),
  );
}

export function scoreLevelLabel(level: string | null | undefined) {
  if (!level) return null;
  const normalized = level.toUpperCase();
  if (normalized === "HIGH") return "Forte adéquation";
  if (normalized === "MEDIUM") return "Adéquation moyenne";
  if (normalized === "LOW") return "Adéquation faible";
  return level;
}
