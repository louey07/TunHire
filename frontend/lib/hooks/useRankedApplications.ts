"use client";

import { useCallback, useState } from "react";
import { apiGet, apiPatchQuery } from "@/lib/api";
import {
  enrichRankedApplications,
} from "@/lib/recruiter/candidates";
import type {
  ApplicationStatus,
  EnrichedRankedApplication,
  RankedApplicationRaw,
} from "@/lib/types";

export function useRankedApplications(jobId: string) {
  const [applications, setApplications] = useState<EnrichedRankedApplication[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadRanked = useCallback(async () => {
    if (!jobId) {
      setApplications([]);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await apiGet<RankedApplicationRaw[]>(
        `/applications/job/${jobId}/ranked`,
      );
      if (!res.success) {
        setMessage(res.message || "Impossible de charger le classement.");
        setApplications([]);
        return;
      }
      const enriched = await enrichRankedApplications(res.data || []);
      setApplications(enriched);
    } catch {
      setMessage("Erreur de connexion.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  async function updateStatus(
    applicationId: number,
    status: ApplicationStatus,
  ) {
    setUpdatingId(applicationId);
    try {
      const res = await apiPatchQuery(`/applications/${applicationId}/status`, {
        status,
      });
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.applicationId === applicationId ? { ...app, status } : app,
          ),
        );
      } else {
        setMessage(res.message || "Impossible de mettre à jour le statut.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  return {
    applications,
    loading,
    message,
    updatingId,
    loadRanked,
    updateStatus,
  };
}
