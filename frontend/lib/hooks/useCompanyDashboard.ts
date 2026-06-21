"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { CompanyDashboardResponse } from "@/lib/types";

export function useCompanyDashboard(companyId: number | null | undefined) {
  const [dashboard, setDashboard] = useState<CompanyDashboardResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (companyId == null) {
      setDashboard(null);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await apiGet<CompanyDashboardResponse>(
        `/companies/${companyId}/dashboard`,
      );
      if (!res.success || !res.data) {
        setError(res.message || "Impossible de charger le tableau de bord.");
        setDashboard(null);
        return;
      }
      setDashboard(res.data);
    } catch {
      setError("Erreur de connexion.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { dashboard, loading, error, refresh };
}
