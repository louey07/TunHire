"use client";

type ChatConnectionBannerProps = {
  connected: boolean;
};

export default function ChatConnectionBanner({
  connected,
}: ChatConnectionBannerProps) {
  if (connected) return null;

  return (
    <p className="rounded-2xl bg-[var(--surface-container-low)] px-4 py-3 text-xs text-[var(--on-surface-variant)]">
      Reconnexion en cours…
    </p>
  );
}
