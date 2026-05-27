import Link from "next/link";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: number | string;
  tone?: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean;
};

export default function StatCard({
  label,
  value,
  tone = "text-[var(--primary)]",
  href,
  icon,
  onClick,
  active,
}: StatCardProps) {
  const className = `surface-section w-full p-5 text-left transition editorial-shadow ${
    active
      ? "ring-2 ring-[color-mix(in_srgb,var(--secondary)_35%,transparent)]"
      : "hover:bg-[var(--surface-container-lowest)]"
  }`;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="label-uppercase text-[10px] font-semibold text-[var(--on-surface-variant)]">
          {label}
        </p>
        {icon ? (
          <span className="text-[var(--on-surface-variant)]">{icon}</span>
        ) : null}
      </div>
      <p className={`mt-2 font-headline text-3xl font-extrabold ${tone}`}>
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
