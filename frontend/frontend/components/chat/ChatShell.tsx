"use client";

import type { ReactNode } from "react";

type ChatShellProps = {
  title: string;
  subtitle: string;
  sidebar: ReactNode;
  content: ReactNode;
};

export default function ChatShell({
  title,
  subtitle,
  sidebar,
  content,
}: ChatShellProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <header className="space-y-3">
        <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
          Messagerie
        </p>
        <h1 className="font-headline text-4xl font-extrabold text-[var(--primary)] lg:text-[2.5rem]">
          {title}
        </h1>
        <p className="max-w-xl text-sm text-[var(--on-surface-variant)]">
          {subtitle}
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">{sidebar}</aside>
        <section className="surface-section flex min-h-[560px] flex-col editorial-shadow">
          {content}
        </section>
      </div>
    </div>
  );
}
