"use client";

type UnreadBadgeProps = {
  count: number;
};

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;
  return (
    <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
