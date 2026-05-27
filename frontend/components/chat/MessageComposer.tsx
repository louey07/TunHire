"use client";

import { useState, type KeyboardEvent } from "react";

type MessageComposerProps = {
  disabled?: boolean;
  onSend: (body: string) => void;
};

export default function MessageComposer({
  disabled = false,
  onSend,
}: MessageComposerProps) {
  const [body, setBody] = useState("");

  function submit() {
    const value = body.trim();
    if (!value) return;
    onSend(value);
    setBody("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="mt-auto border-t border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] p-5">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        disabled={disabled}
        placeholder="Écrire un message…"
        className="w-full resize-none rounded-2xl bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--secondary)_25%,transparent)] disabled:opacity-60"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[10px] text-[var(--on-surface-variant)]">
          Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !body.trim()}
          className="btn-primary rounded-full px-5 py-2 text-sm disabled:opacity-60"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
