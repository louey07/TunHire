"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ChatConnectionBanner from "@/components/chat/ChatConnectionBanner";
import ChatPane from "@/components/chat/ChatPane";
import ChatShell from "@/components/chat/ChatShell";
import ConversationList from "@/components/chat/ConversationList";
import { getUser, requireRole } from "@/lib/auth";
import { formatDirectChatLabel } from "@/lib/chat/labels";
import { useChatConversations } from "@/lib/hooks/useChatConversations";
import { useChatSocket } from "@/lib/hooks/useChatSocket";

export default function CandidateChatPage() {
  const router = useRouter();
  const user = getUser();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    loading,
    error,
  } = useChatConversations();

  const directConversations = useMemo(
    () => conversations.filter((item) => item.type === "DIRECT"),
    [conversations],
  );

  const { messages, loading: messagesLoading, connected, sendMessage } =
    useChatSocket({
      conversationId: activeConversationId,
    });

  useEffect(() => {
    requireRole("CANDIDATE", router);
  }, [router]);

  useEffect(() => {
    if (directConversations.length === 0) {
      setActiveConversationId(null);
      return;
    }
    setActiveConversationId((current) => {
      if (current && directConversations.some((item) => item.id === current)) {
        return current;
      }
      return directConversations[0]?.id ?? null;
    });
  }, [directConversations, setActiveConversationId]);

  const formatCandidateTitle = (conversation: (typeof directConversations)[number]) =>
    formatDirectChatLabel(conversation, "CANDIDATE");

  const paneTitle = activeConversation
    ? formatCandidateTitle(activeConversation)
    : "Sélectionnez une conversation";
  const paneMeta = activeConversation?.companyName
    ? activeConversation.companyName
    : activeConversation
      ? "Discussion avec un recruteur"
      : loading
        ? "Chargement…"
        : `${directConversations.length} conversation(s)`;

  return (
    <ChatShell
      title="Messages recruteurs"
      subtitle="Répondez aux recruteurs qui vous contactent. Vous ne pouvez pas initier une nouvelle discussion."
      sidebar={
        <>
          <div className="rounded-2xl bg-[var(--surface-container-low)] p-4">
            <p className="text-xs leading-relaxed text-[var(--on-surface-variant)]">
              Les recruteurs ouvrent les conversations. Dès qu&apos;un
              recruteur vous écrit, la discussion apparaît ici et vous pouvez
              répondre.
            </p>
          </div>
          <ChatConnectionBanner connected={connected} />
          {error ? <p className="text-sm text-[#93000a]">{error}</p> : null}
          <ConversationList
            conversations={directConversations}
            activeConversationId={activeConversationId}
            onSelect={setActiveConversationId}
            emptyMessage="Aucun recruteur ne vous a encore contacté."
            formatTitle={formatCandidateTitle}
          />
        </>
      }
      content={
        <ChatPane
          title={paneTitle}
          meta={paneMeta}
          messages={messages}
          currentUserId={user?.id ?? null}
          messagesLoading={messagesLoading}
          connected={connected}
          composerDisabled={!activeConversationId}
          onSend={sendMessage}
          emptySelection={
            <div className="max-w-sm space-y-2 text-center">
              <p className="font-headline text-lg font-bold text-[var(--primary)]">
                Boîte de réception vide
              </p>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Vous recevrez ici les messages des recruteurs intéressés par
                votre profil. En attendant, continuez à compléter votre CV et
                postuler aux offres.
              </p>
            </div>
          }
        />
      }
    />
  );
}
