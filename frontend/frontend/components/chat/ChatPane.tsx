"use client";

import type { ReactNode } from "react";
import MessageComposer from "@/components/chat/MessageComposer";
import MessageList from "@/components/chat/MessageList";
import type { ChatMessage } from "@/lib/types";

type ChatPaneProps = {
  title: string;
  meta?: string;
  messages: ChatMessage[];
  currentUserId: number | null;
  messagesLoading?: boolean;
  connected: boolean;
  composerDisabled?: boolean;
  emptySelection?: ReactNode;
  onSend: (body: string) => void;
};

export default function ChatPane({
  title,
  meta,
  messages,
  currentUserId,
  messagesLoading = false,
  connected,
  composerDisabled = false,
  emptySelection,
  onSend,
}: ChatPaneProps) {
  const hasSelection = title !== "Sélectionnez une conversation";

  return (
    <>
      <div className="border-b border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] px-6 py-5">
        <p className="font-headline text-xl font-bold text-[var(--primary)]">
          {title}
        </p>
        {meta ? (
          <p className="mt-1 text-xs text-[var(--on-surface-variant)]">{meta}</p>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {!hasSelection && emptySelection ? (
          <div className="flex flex-1 items-center justify-center p-8">
            {emptySelection}
          </div>
        ) : messagesLoading ? (
          <div className="space-y-3 p-6">
            <div className="surface-card h-20 animate-pulse rounded-2xl" />
            <div className="surface-card h-20 animate-pulse rounded-2xl" />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <MessageList messages={messages} currentUserId={currentUserId} />
          </div>
        )}

        <MessageComposer
          disabled={composerDisabled || !hasSelection || !connected}
          onSend={onSend}
        />
      </div>
    </>
  );
}
