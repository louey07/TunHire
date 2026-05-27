import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
      <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
        404
      </p>
      <h1 className="mt-3 font-headline text-4xl font-extrabold text-[var(--primary)]">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--on-surface-variant)]">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/jobs"
        className="btn-primary mt-8 rounded-2xl px-6 py-3 text-sm"
      >
        Retour aux offres
      </Link>
    </div>
  );
}
