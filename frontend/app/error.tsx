"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="label-uppercase text-[10px] font-bold text-[var(--secondary)]">
        500
      </p>
      <h1 className="mt-3 font-headline text-4xl font-extrabold text-[var(--primary)]">
        Une erreur est survenue
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--on-surface-variant)]">
        Le service a rencontré un problème inattendu. Réessayez dans quelques
        instants.
      </p>
      {process.env.NODE_ENV === "development" && error?.message ? (
        <p className="mt-4 max-w-lg break-words rounded-xl bg-[#93000a]/10 px-4 py-3 text-left text-xs text-[#93000a]">
          {error.message}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="btn-secondary rounded-2xl px-6 py-3 text-sm"
        >
          Réessayer
        </button>
        <Link
          href="/dashboard/recruiter/candidates"
          className="btn-primary rounded-2xl px-6 py-3 text-sm"
        >
          Retour aux candidats
        </Link>
      </div>
    </div>
  );
}
