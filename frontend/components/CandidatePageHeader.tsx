import type { ReactNode } from "react";

type CandidatePageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export default function CandidatePageHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  className = "",
}: CandidatePageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}
    >
      <div>
        <p className="label-uppercase text-[10px] font-semibold text-[var(--secondary)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-headline text-4xl font-extrabold text-[var(--primary)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-xl text-sm text-[var(--on-surface-variant)]">
            {subtitle}
          </p>
        ) : null}
        {meta ? (
          <div className="mt-2 text-sm text-[var(--on-surface-variant)]">
            {meta}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
