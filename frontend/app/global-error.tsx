"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[var(--surface)] font-body antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
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
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-2xl bg-[var(--surface-container-high)] px-6 py-3 text-sm font-semibold text-[var(--primary)]"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
            >
              Accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
