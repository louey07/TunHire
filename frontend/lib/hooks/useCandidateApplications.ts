"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet } from "@/lib/api";
import {
  countByStatus,
  sortByCreatedAtDesc,
} from "@/lib/status/applications";
import type { Application, Job } from "@/lib/types";

export function useCandidateApplications(userId?: number | null) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobsById, setJobsById] = useState<Record<number, Job>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setApplications([]);
      setJobsById({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await apiGet<Application[]>(`/applications?userId=${userId}`);
      if (!data.success) {
        setError("Impossible de charger les candidatures.");
        setApplications([]);
        setJobsById({});
        return;
      }

      const list = sortByCreatedAtDesc(data.data || []);
      setApplications(list);

      const jobIds = Array.from(
        new Set(
          list
            .map((app) => app.jobId)
            .filter((id): id is number => typeof id === "number"),
        ),
      );

      if (!jobIds.length) {
        setJobsById({});
        return;
      }

      const entries = await Promise.all(
        jobIds.map(async (jobId) => {
          try {
            const jobData = await apiGet<Job>(`/jobs/${jobId}`);
            if (jobData.success && jobData.data) {
              return [jobId, jobData.data] as const;
            }
          } catch {
            /* ignore */
          }
          return [jobId, null] as const;
        }),
      );

      const map: Record<number, Job> = {};
      entries.forEach(([id, job]) => {
        if (job) map[id] = job;
      });
      setJobsById(map);
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
      setApplications([]);
      setJobsById({});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const statusCounts = countByStatus(applications);

  const deleteApplication = useCallback(async (applicationId: number) => {
    setDeletingId(applicationId);
    setError("");
    try {
      const res = await apiDelete(`/applications/${applicationId}`);
      if (!res.success) {
        setError(res.message || "Impossible de supprimer cette candidature.");
        return false;
      }
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
      return true;
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
      return false;
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    applications,
    jobsById,
    statusCounts,
    loading,
    error,
    deletingId,
    refresh,
    deleteApplication,
  };
}
