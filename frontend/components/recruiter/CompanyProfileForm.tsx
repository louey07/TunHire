"use client";

import { useEffect, useState } from "react";
import {
  emptyCompanyFormValues,
  validateCompanyForm,
} from "@/lib/recruiter/company";
import type { CompanyFormValues } from "@/lib/types";

type CompanyProfileFormProps = {
  initialValues?: Partial<CompanyFormValues>;
  readOnly?: boolean;
  submitLabel?: string;
  loading?: boolean;
  error?: string;
  successMessage?: string;
  onSubmit?: (values: CompanyFormValues) => void | Promise<void>;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="label-uppercase mb-2 text-[10px] font-bold text-[var(--on-surface-variant)]">
      {children}
    </p>
  );
}

export default function CompanyProfileForm({
  initialValues,
  readOnly = false,
  submitLabel = "Enregistrer",
  loading = false,
  error,
  successMessage,
  onSubmit,
}: CompanyProfileFormProps) {
  const [form, setForm] = useState<CompanyFormValues>({
    ...emptyCompanyFormValues,
    ...initialValues,
  });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setForm({
      ...emptyCompanyFormValues,
      ...initialValues,
    });
  }, [initialValues]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly || !onSubmit) return;
    const message = validateCompanyForm(form);
    if (message) {
      setValidationError(message);
      return;
    }
    setValidationError("");
    await onSubmit(form);
  }

  const displayError = validationError || error;

  if (readOnly) {
    return (
      <div className="surface-section space-y-6 p-8 editorial-shadow">
        <div>
          <FieldLabel>Nom</FieldLabel>
          <p className="font-headline text-xl font-bold text-[var(--primary)]">
            {form.name || "—"}
          </p>
        </div>
        <div>
          <FieldLabel>Localisation</FieldLabel>
          <p className="text-sm text-[var(--on-surface-variant)]">
            {form.location || "Non renseignée"}
          </p>
        </div>
        <div>
          <FieldLabel>Site web</FieldLabel>
          <p className="text-sm text-[var(--on-surface-variant)]">
            {form.website || "Non renseigné"}
          </p>
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <p className="text-sm leading-7 text-[var(--on-surface-variant)]">
            {form.description || "Aucune description pour le moment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      className="surface-section space-y-5 p-8 editorial-shadow"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <div>
        <FieldLabel>Nom</FieldLabel>
        <input
          className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
          placeholder="Nom de l'entreprise"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </div>
      <div>
        <FieldLabel>Localisation</FieldLabel>
        <input
          className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
          placeholder="Ville, région ou remote"
          value={form.location}
          onChange={(e) =>
            setForm((p) => ({ ...p, location: e.target.value }))
          }
        />
      </div>
      <div>
        <FieldLabel>Site web</FieldLabel>
        <input
          className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
          placeholder="https://exemple.tn"
          value={form.website}
          onChange={(e) =>
            setForm((p) => ({ ...p, website: e.target.value }))
          }
        />
      </div>
      <div>
        <FieldLabel>Logo (URL)</FieldLabel>
        <input
          className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
          placeholder="https://…/logo.png"
          value={form.logoUrl}
          onChange={(e) =>
            setForm((p) => ({ ...p, logoUrl: e.target.value }))
          }
        />
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
          rows={5}
          placeholder="Présentez votre entreprise aux candidats…"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary rounded-2xl px-6 py-3 text-sm disabled:opacity-60"
      >
        {loading ? "Enregistrement…" : submitLabel}
      </button>
      {displayError ? (
        <p className="text-sm text-[#93000a]">{displayError}</p>
      ) : null}
      {successMessage ? (
        <p className="text-sm text-[var(--secondary)]">{successMessage}</p>
      ) : null}
    </form>
  );
}
