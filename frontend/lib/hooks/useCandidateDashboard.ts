"use client";

import { useMemo } from "react";
import { getUser } from "@/lib/auth";
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfile";
import { useCandidateApplications } from "@/lib/hooks/useCandidateApplications";

export function useCandidateDashboard() {
  const profileState = useCandidateProfile();
  const authUser = getUser();
  const userId = profileState.profile?.userId ?? authUser?.id;
  const appsState = useCandidateApplications(userId);

  const recentApplications = useMemo(
    () => appsState.applications.slice(0, 6),
    [appsState.applications],
  );

  const profileChecklist = useMemo(() => {
    const profile = profileState.profile;
    return {
      hasBio: Boolean(profile?.bio?.trim()),
      hasLocation: Boolean(profile?.location?.trim()),
      hasSkills: (profile?.skills?.length ?? 0) >= 3,
      hasCv: Boolean(profile?.hasResume || profile?.resumeUrl),
      skillsCount: profile?.skills?.length ?? 0,
    };
  }, [profileState.profile]);

  const checklistProgress = useMemo(() => {
    const items = [
      profileChecklist.hasBio,
      profileChecklist.hasLocation,
      profileChecklist.hasSkills,
      profileChecklist.hasCv,
    ];
    const done = items.filter(Boolean).length;
    return Math.round((done / items.length) * 100);
  }, [profileChecklist]);

  return {
    ...profileState,
    ...appsState,
    recentApplications,
    profileChecklist,
    checklistProgress,
    totalApplications: appsState.applications.length,
  };
}

export function getTimeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}
