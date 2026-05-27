"use client";

import { useRecruiterCompany } from "@/lib/context/RecruiterCompanyContext";
import { roleLabel } from "@/components/recruiter/CompanyPicker";

export default function CompanySwitcher() {
  const { companies, activeCompany, selectCompany, loading } =
    useRecruiterCompany();

  if (loading || companies.length <= 1) {
    if (!activeCompany) return null;
    return (
      <div className="mb-6 rounded-2xl bg-[var(--surface-container-lowest)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--primary)]">
          {activeCompany.companyName}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--on-surface-variant)]">
          {roleLabel(activeCompany.role)}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
        Entreprise active
      </label>
      <select
        value={activeCompany?.companyId ?? ""}
        onChange={(e) => selectCompany(Number(e.target.value))}
        className="input-soft mt-2 w-full rounded-2xl px-4 py-2 text-sm"
      >
        <option value="" disabled>
          Choisir une entreprise
        </option>
        {companies.map((company) => (
          <option key={company.companyId} value={company.companyId}>
            {company.companyName} ({roleLabel(company.role)})
          </option>
        ))}
      </select>
    </div>
  );
}
