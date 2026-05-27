"use client";

import type { ChatConversation } from "@/lib/types";
import UnreadBadge from "@/components/chat/UnreadBadge";

type ConversationListProps = {
  conversations: ChatConversation[];
  activeConversationId: number | null;
  onSelect: (id: number) => void;
  emptyMessage?: string;
  formatTitle?: (conversation: ChatConversation) => string;
};

function formatTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-TN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function conversationKindLabel(type: ChatConversation["type"]) {
  return type === "COMPANY_TEAM" ? "Équipe" : "Direct";
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  emptyMessage = "Aucune conversation disponible.",
  formatTitle,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--surface-container-low)] p-5 text-sm text-[var(--on-surface-variant)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => {
        const active = activeConversationId === conversation.id;
        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={`flex w-full items-start justify-between gap-3 rounded-2xl p-4 text-left transition ${
              active
                ? "bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface-container-lowest))] editorial-shadow"
                : "bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-highest)]"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-[var(--primary)]">
                  {formatTitle
                    ? formatTitle(conversation)
                    : conversation.title}
                </p>
                <span className="rounded-full bg-[var(--surface-container-highest)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--on-surface-variant)]">
                  {conversationKindLabel(conversation.type)}
                </span>
              </div>
              <p className="mt-2 truncate text-xs text-[var(--on-surface-variant)]">
                {conversation.lastMessage || "Nouvelle conversation"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="text-[10px] text-[var(--on-surface-variant)]">
                {formatTime(conversation.lastMessageAt || conversation.updatedAt)}
              </span>
              <UnreadBadge count={conversation.unreadCount} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
