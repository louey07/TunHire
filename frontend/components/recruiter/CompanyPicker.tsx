import type { CompanyMembershipSummary, MemberRole } from "@/lib/types";

export const ROLE_LABELS: Record<MemberRole, string> = {
  RECRUITER_ADMIN: "Admin",
  MEMBER: "Membre",
};

export function roleLabel(role?: MemberRole | string | null) {
  if (role === "RECRUITER_ADMIN") return ROLE_LABELS.RECRUITER_ADMIN;
  if (role === "MEMBER") return ROLE_LABELS.MEMBER;
  return "Membre";
}

type CompanyPickerProps = {
  companies: CompanyMembershipSummary[];
  onSelect: (companyId: number) => void;
  loading?: boolean;
};

export default function CompanyPicker({
  companies,
  onSelect,
  loading,
}: CompanyPickerProps) {
  if (loading) {
    return (
      <p className="text-sm text-[var(--on-surface-variant)]">
        Chargement des entreprises…
      </p>
    );
  }

  if (companies.length === 0) {
    return (
      <p className="text-sm text-[var(--on-surface-variant)]">
        Aucune entreprise liée pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <button
          key={company.companyId}
          type="button"
          onClick={() => onSelect(company.companyId)}
          className="surface-section flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition hover:editorial-shadow"
        >
          <div>
            <p className="font-semibold text-[var(--primary)]">
              {company.companyName}
            </p>
            <p className="mt-1 text-xs text-[var(--on-surface-variant)]">
              {company.location || "Localisation non renseignée"}
            </p>
          </div>
          <span className="rounded-full bg-[var(--surface-container-high)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--on-surface-variant)]">
            {roleLabel(company.role)}
          </span>
        </button>
      ))}
    </div>
  );
}
