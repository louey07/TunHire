"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
  }

  return (
    <form
      className="mt-10 flex max-w-3xl flex-col gap-3 rounded-3xl bg-[var(--surface-container-lowest)] p-3 editorial-shadow md:flex-row md:items-center"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[var(--surface-container-low)] px-4">
        <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
        <input
          aria-label="Métier ou compétence"
          className="w-full bg-transparent py-4 text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
          placeholder="Métier ou compétence"
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[var(--surface-container-low)] px-4">
        <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
        <input
          aria-label="Ville"
          className="w-full bg-transparent py-4 text-sm font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none"
          placeholder="Tunis, Sfax, Sousse..."
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>
      <button
        className="rounded-2xl bg-[var(--secondary)] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary)]"
        type="submit"
      >
        Explorer les offres
      </button>
    </form>
  );
}
