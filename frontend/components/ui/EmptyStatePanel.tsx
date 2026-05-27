import type { ReactNode } from "react";

type EmptyStatePanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export default function EmptyStatePanel({
  title,
  description,
  action,
  icon,
}: EmptyStatePanelProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--outline-variant)_25%,transparent)] px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-container-high)] text-[var(--primary)]">
        {icon ?? <span className="text-xl">∅</span>}
      </div>
      <p className="font-headline text-lg font-bold text-[var(--primary)]">
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--on-surface-variant)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
