"use client";

export type ChatView = "team" | "direct";

type ChatViewSwitcherProps = {
  value: ChatView;
  onChange: (view: ChatView) => void;
  directCount: number;
};

export default function ChatViewSwitcher({
  value,
  onChange,
  directCount,
}: ChatViewSwitcherProps) {
  const tabs: { id: ChatView; label: string; badge?: number }[] = [
    { id: "team", label: "Équipe" },
    { id: "direct", label: "Candidats", badge: directCount },
  ];

  return (
    <div className="flex gap-2 rounded-2xl bg-[var(--surface-container-low)] p-1">
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              active
                ? "bg-[var(--surface-container-lowest)] text-[var(--primary)] editorial-shadow"
                : "text-[var(--on-surface-variant)] hover:text-[var(--primary)]"
            }`}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 ? (
              <span className="rounded-full bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
