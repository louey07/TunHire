"use client";

import { useState } from "react";
import {
  CONTRACT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  WORK_MODE_OPTIONS,
  normalizeContractType,
  normalizeExperienceLevel,
} from "@/lib/recruiter/jobs";
import type { JobFormValues, WorkMode } from "@/lib/types";

export const emptyJobFormValues: JobFormValues = {
  title: "",
  location: "",
  workMode: "ON_SITE",
  contractType: "CDI",
  description: "",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
};

type FieldErrors = Partial<Record<keyof JobFormValues, string>>;

type JobFormProps = {
  initialValues?: Partial<JobFormValues>;
  submitLabel: string;
  secondaryLabel?: string;
  loading?: boolean;
  error?: string;
  onSubmit: (values: JobFormValues) => void | Promise<void>;
  onSecondarySubmit?: (values: JobFormValues) => void | Promise<void>;
};

function validate(values: JobFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.title.trim()) errors.title = "Le titre est requis.";
  if (!values.location.trim()) errors.location = "La localisation est requise.";
  if (!values.description.trim()) {
    errors.description = "La description est requise.";
  } else if (values.description.trim().length < 50) {
    errors.description = "La description doit contenir au moins 50 caractères.";
  }
  if (!values.workMode) errors.workMode = "Le mode de travail est requis.";
  return errors;
}

function FormSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-headline text-lg font-bold text-[var(--primary)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function JobForm({
  initialValues,
  submitLabel,
  secondaryLabel,
  loading = false,
  error,
  onSubmit,
  onSecondarySubmit,
}: JobFormProps) {
  const [form, setForm] = useState<JobFormValues>({
    ...emptyJobFormValues,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(
    e: React.FormEvent,
    handler: (values: JobFormValues) => void | Promise<void>,
  ) {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    await handler(form);
  }

  return (
    <form
      className="surface-section p-6 editorial-shadow md:p-8"
      onSubmit={(e) => void handleSubmit(e, onSubmit)}
    >
      <FormSection eyebrow="Offre" title="Informations de base">
        <div>
          <input
            className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
            placeholder="Titre du poste *"
            value={form.title}
            onChange={(e) =>
              setForm((p) => ({ ...p, title: e.target.value }))
            }
          />
          {fieldErrors.title ? (
            <p className="mt-1 text-xs text-[#93000a]">{fieldErrors.title}</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-[var(--on-surface-variant)]">
              Type de contrat
            </label>
            <select
              className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
              value={form.contractType}
              onChange={(e) =>
                setForm((p) => ({ ...p, contractType: e.target.value }))
              }
            >
              {CONTRACT_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-[var(--on-surface-variant)]">
              Niveau d&apos;expérience
            </label>
            <select
              className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
              value={form.experienceLevel}
              onChange={(e) =>
                setForm((p) => ({ ...p, experienceLevel: e.target.value }))
              }
            >
              <option value="">Sélectionner un niveau</option>
              {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection eyebrow="Lieu" title="Localisation et mode de travail">
        <div>
          <input
            className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
            placeholder="Localisation (ville, région ou pays) *"
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
          />
          {fieldErrors.location ? (
            <p className="mt-1 text-xs text-[#93000a]">
              {fieldErrors.location}
            </p>
          ) : null}
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold text-[var(--on-surface-variant)]">
            Mode de travail *
          </p>
          <div className="flex flex-wrap gap-2">
            {WORK_MODE_OPTIONS.map((option) => {
              const active = form.workMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      workMode: option.value as WorkMode,
                    }))
                  }
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-[var(--primary)] text-[var(--on-primary)]"
                      : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {fieldErrors.workMode ? (
            <p className="mt-1 text-xs text-[#93000a]">{fieldErrors.workMode}</p>
          ) : null}
        </div>
      </FormSection>

      <FormSection eyebrow="Rémunération" title="Fourchette salariale (optionnel)">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="number"
            className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
            placeholder="Salaire min (TND)"
            value={form.salaryMin}
            onChange={(e) =>
              setForm((p) => ({ ...p, salaryMin: e.target.value }))
            }
          />
          <input
            type="number"
            className="input-soft w-full rounded-2xl px-4 py-3 text-sm"
            placeholder="Salaire max (TND)"
            value={form.salaryMax}
            onChange={(e) =>
              setForm((p) => ({ ...p, salaryMax: e.target.value }))
            }
          />
        </div>
      </FormSection>

      <FormSection eyebrow="Description" title="Description du poste">
        <div>
          <textarea
            className="input-soft-flat w-full px-4 py-3 text-sm"
            rows={8}
            placeholder="Décrivez le poste, les missions et le profil recherché (min. 50 caractères) *"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
          {fieldErrors.description ? (
            <p className="mt-1 text-xs text-[#93000a]">
              {fieldErrors.description}
            </p>
          ) : null}
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-6 border-t border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] bg-[var(--surface-container-lowest)] px-6 py-4 md:-mx-8 md:px-8">
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary rounded-2xl px-6 py-3 text-sm disabled:opacity-60"
          >
            {loading ? "Enregistrement…" : submitLabel}
          </button>
          {secondaryLabel && onSecondarySubmit ? (
            <button
              type="button"
              disabled={loading}
              onClick={(e) => void handleSubmit(e, onSecondarySubmit)}
              className="btn-secondary rounded-2xl px-6 py-3 text-sm disabled:opacity-60"
            >
              {loading ? "Enregistrement…" : secondaryLabel}
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="mt-3 text-sm text-[#93000a]">{error}</p>
        ) : null}
      </div>
    </form>
  );
}

export function jobFormValuesToRequest(
  values: JobFormValues,
  companyId: number,
) {
  return {
    companyId,
    title: values.title.trim(),
    location: values.location.trim(),
    workMode: values.workMode,
    contractType: values.contractType.trim(),
    description: values.description.trim(),
    experienceLevel: values.experienceLevel.trim() || null,
    salaryMin: values.salaryMin ? Number(values.salaryMin) : null,
    salaryMax: values.salaryMax ? Number(values.salaryMax) : null,
  };
}

export function jobToFormValues(job: {
  title: string;
  location: string;
  workMode?: string | null;
  contractType?: string | null;
  description: string;
  experienceLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
}): JobFormValues {
  const workMode =
    job.workMode === "HYBRID" || job.workMode === "REMOTE"
      ? job.workMode
      : "ON_SITE";

  return {
    title: job.title || "",
    location: job.location || "",
    workMode,
    contractType: normalizeContractType(job.contractType),
    description: job.description || "",
    experienceLevel: normalizeExperienceLevel(job.experienceLevel),
    salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
  };
}
