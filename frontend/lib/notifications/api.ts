import { apiGet, apiPost } from "@/lib/api";

export type NotificationBadges = {
  chatUnread: number;
  newApplications: number;
  applicationUpdates: number;
};

export async function getNotificationBadges(companyId?: number | null) {
  const query =
    companyId != null ? `?companyId=${encodeURIComponent(String(companyId))}` : "";
  return apiGet<NotificationBadges>(`/notifications/badges${query}`);
}

export async function markRecruiterCandidatesSeen(companyId: number) {
  return apiPost<void>(
    `/notifications/recruiter/candidates-seen?companyId=${encodeURIComponent(String(companyId))}`,
  );
}

export async function markCandidateApplicationsSeen() {
  return apiPost<void>("/notifications/candidate/applications-seen");
}
