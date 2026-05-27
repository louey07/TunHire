import Link from "next/link";

type ProfileChecklistProps = {
  checklist: {
    hasBio: boolean;
    hasLocation: boolean;
    hasSkills: boolean;
    hasCv: boolean;
    skillsCount: number;
  };
  progress: number;
  profileScore: number;
};

const ITEMS = [
  {
    key: "bio" as const,
    label: "Ajouter une bio",
    href: "/dashboard/candidate/profile",
    check: (c: ProfileChecklistProps["checklist"]) => c.hasBio,
  },
  {
    key: "location" as const,
    label: "Indiquer votre localisation",
    href: "/dashboard/candidate/profile",
    check: (c: ProfileChecklistProps["checklist"]) => c.hasLocation,
  },
  {
    key: "skills" as const,
    label: "Ajouter 3 compétences minimum",
    href: "/dashboard/candidate/profile",
    check: (c: ProfileChecklistProps["checklist"]) => c.hasSkills,
  },
  {
    key: "cv" as const,
    label: "Importer votre CV",
    href: "/dashboard/candidate/profile",
    check: (c: ProfileChecklistProps["checklist"]) => c.hasCv,
  },
];

export default function ProfileChecklist({
  checklist,
  progress,
  profileScore,
}: ProfileChecklistProps) {
  return (
    <section className="surface-section p-5 editorial-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
            Profil
          </p>
          <h2 className="mt-1 font-headline text-lg font-bold text-[var(--primary)]">
            Compléter votre profil
          </h2>
        </div>
        <span className="rounded-full bg-[var(--secondary)]/10 px-3 py-1 text-xs font-bold text-[var(--secondary)]">
          {profileScore}%
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-container-high)]">
          <div
            className="h-full rounded-full bg-[var(--secondary)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
          {progress}% des étapes complétées
        </p>
      </div>

      <ul className="mt-5 space-y-2">
        {ITEMS.map((item) => {
          const done = item.check(checklist);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  done
                    ? "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]"
                    : "bg-[var(--surface-container-high)] font-semibold text-[var(--primary)] hover:bg-[var(--surface-container-highest)]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    done
                      ? "bg-[var(--secondary)] text-white"
                      : "border border-[color-mix(in_srgb,var(--outline-variant)_30%,transparent)]"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                {item.label}
                {item.key === "skills" && !done ? (
                  <span className="ml-auto text-xs opacity-70">
                    {checklist.skillsCount}/3
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
