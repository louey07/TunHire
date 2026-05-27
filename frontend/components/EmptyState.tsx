import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-container-high)] text-[var(--primary)]">
        ∅
      </div>
      <div>
        <h3 className="text-xl font-bold text-[var(--primary)]">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-md text-sm text-[var(--on-surface-variant)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
