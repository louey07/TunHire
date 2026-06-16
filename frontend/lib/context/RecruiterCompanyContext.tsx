"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiGet } from "@/lib/api";
import {
  clearStoredCompanyId,
  getStoredCompanyId,
  setStoredCompanyId,
} from "@/lib/company";
import type { CompanyMembershipSummary } from "@/lib/types";

type RecruiterCompanyContextValue = {
  companies: CompanyMembershipSummary[];
  activeCompany: CompanyMembershipSummary | null;
  loading: boolean;
  error: string;
  isAdmin: boolean;
  selectCompany: (companyId: number) => void;
  clearActiveCompany: () => void;
  refresh: () => Promise<void>;
};

const RecruiterCompanyContext =
  createContext<RecruiterCompanyContextValue | null>(null);

export function RecruiterCompanyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [companies, setCompanies] = useState<CompanyMembershipSummary[]>([]);
  const [activeCompany, setActiveCompany] =
    useState<CompanyMembershipSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applySelection = useCallback(
    (list: CompanyMembershipSummary[], preferredId?: string | null) => {
      if (!list.length) {
        setActiveCompany(null);
        clearStoredCompanyId();
        return;
      }
      const stored = preferredId ?? getStoredCompanyId();
      const match = stored
        ? list.find((c) => String(c.companyId) === stored)
        : undefined;
      if (match) {
        setActiveCompany(match);
        setStoredCompanyId(match.companyId);
        return;
      }
      if (list.length === 1) {
        setActiveCompany(list[0]);
        setStoredCompanyId(list[0].companyId);
        return;
      }
      setActiveCompany(null);
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet<CompanyMembershipSummary[]>("/companies/mine");
      if (!res.success) {
        setError(res.message || "Impossible de charger vos entreprises.");
        setCompanies([]);
        setActiveCompany(null);
        return;
      }
      const list = res.data || [];
      setCompanies(list);
      applySelection(list);
    } catch {
      setError("Erreur de connexion.");
      setCompanies([]);
      setActiveCompany(null);
    } finally {
      setLoading(false);
    }
  }, [applySelection]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectCompany = useCallback(
    (companyId: number) => {
      const match = companies.find((c) => c.companyId === companyId);
      if (!match) return;
      setActiveCompany(match);
      setStoredCompanyId(match.companyId);
    },
    [companies],
  );

  const clearActiveCompany = useCallback(() => {
    setActiveCompany(null);
    clearStoredCompanyId();
  }, []);

  const value = useMemo(
    () => ({
      companies,
      activeCompany,
      loading,
      error,
      isAdmin: activeCompany?.role === "RECRUITER_ADMIN",
      selectCompany,
      clearActiveCompany,
      refresh,
    }),
    [
      companies,
      activeCompany,
      loading,
      error,
      selectCompany,
      clearActiveCompany,
      refresh,
    ],
  );

  return (
    <RecruiterCompanyContext.Provider value={value}>
      {children}
    </RecruiterCompanyContext.Provider>
  );
}

export function useRecruiterCompany() {
  const ctx = useContext(RecruiterCompanyContext);
  if (!ctx) {
    throw new Error(
      "useRecruiterCompany must be used within RecruiterCompanyProvider",
    );
  }
  return ctx;
}
