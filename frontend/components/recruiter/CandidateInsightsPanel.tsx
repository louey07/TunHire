"use client";

import type { CandidateProfile } from "@/lib/types";

type CandidateInsightsPanelProps = {
  profile: CandidateProfile | null;
  matchedSkills: string[] | null;
};

export default function CandidateInsightsPanel({
  profile,
  matchedSkills,
}: CandidateInsightsPanelProps) {
  return (
    <div className="space-y-6">
      <section className="surface-section p-6 editorial-shadow">
        <h2 className="font-headline text-lg font-bold text-[var(--primary)]">
          À propos
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--on-surface-variant)]">
          {profile?.bio || "Aucune biographie renseignée."}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
            <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
              Localisation
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
              {profile?.location || "Non renseignée"}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
            <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
              Expérience
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
              {profile?.yearsOfExperience != null
                ? `${profile.yearsOfExperience} ans`
                : "Non renseignée"}
            </p>
          </div>
        </div>
      </section>

      {matchedSkills && matchedSkills.length > 0 ? (
        <section className="surface-section p-6 editorial-shadow">
          <h2 className="font-headline text-lg font-bold text-[var(--primary)]">
            Compétences correspondantes (IA)
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full px-3 py-1 text-xs font-semibold text-[var(--primary)]"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 10%, transparent), color-mix(in srgb, var(--tertiary-fixed) 16%, transparent))",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
        <section className="surface-section p-6 editorial-shadow">
          <h2 className="font-headline text-lg font-bold text-[var(--primary)]">
            Toutes les compétences
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-full bg-[var(--surface-container-high)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]"
              >
                {skill.skillName}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
