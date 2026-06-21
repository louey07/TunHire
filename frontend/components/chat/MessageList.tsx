"use client";

import type { ChatMessage } from "@/lib/types";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId: number | null;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  if (!messages.length) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-[var(--surface-container-low)] p-10 text-center">
        <div className="max-w-sm space-y-2">
          <p className="font-headline text-lg font-bold text-[var(--primary)]">
            Aucun message
          </p>
          <p className="text-sm text-[var(--on-surface-variant)]">
            Les messages de cette conversation apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const mine = currentUserId != null && message.senderUserId === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex ${mine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[min(80%,520px)] rounded-2xl px-4 py-3 ${
                mine
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--surface-container-low)] text-[var(--on-surface)]"
              }`}
            >
              {!mine ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--secondary)]">
                  {message.senderFirstName} {message.senderLastName}
                </p>
              ) : null}
              <p className={`whitespace-pre-wrap text-sm ${mine ? "" : "mt-1"}`}>
                {message.deleted ? "Message supprimé" : message.body}
              </p>
              <p
                className={`mt-2 text-[10px] ${
                  mine ? "text-white/70" : "text-[var(--on-surface-variant)]"
                }`}
              >
                {formatDateTime(message.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
