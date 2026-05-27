import Link from "next/link";

type ProfileHeroProps = {
  firstName: string;
  lastName?: string;
  profileScore: number;
  skillsCount: number;
  experienceLabel: string;
};

export default function ProfileHero({
  firstName,
  lastName,
  profileScore,
  skillsCount,
  experienceLabel,
}: ProfileHeroProps) {
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return (
    <section
      className="relative overflow-hidden rounded-3xl p-8 text-white editorial-shadow"
      style={{
        background:
          "linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)",
      }}
    >
      <div className="relative grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight md:text-4xl">
            Bienvenue, {displayName || "..."}
          </h2>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
            <span>Profil complété à</span>
            <span className="font-bold text-[var(--secondary-bright)]">
              {profileScore}%
            </span>
          </div>
          <div className="mt-6">
            <Link href="/jobs" className="btn-secondary rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[var(--primary)]">
              Parcourir les offres
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
            <p className="font-headline text-3xl font-extrabold text-[var(--secondary-bright)]">
              {skillsCount}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              Compétences
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
            <p className="font-headline text-3xl font-extrabold text-[var(--tertiary)]">
              {experienceLabel}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              Expérience
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
