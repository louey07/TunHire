"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatConnectionBanner from "@/components/chat/ChatConnectionBanner";
import ChatPane from "@/components/chat/ChatPane";
import ChatShell from "@/components/chat/ChatShell";
import ChatViewSwitcher, { type ChatView } from "@/components/chat/ChatViewSwitcher";
import ConversationList from "@/components/chat/ConversationList";
import { getUser, requireRole } from "@/lib/auth";
import { formatDirectChatLabel } from "@/lib/chat/labels";
import {
  RecruiterSetupNotice,
  useRequireActiveCompany,
} from "@/lib/hooks/useRequireActiveCompany";
import { useChatConversations } from "@/lib/hooks/useChatConversations";
import { useChatSocket } from "@/lib/hooks/useChatSocket";

function RecruiterChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUser();
  const { activeCompany, loading: companyLoading } = useRequireActiveCompany();
  const [view, setView] = useState<ChatView>("team");

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    error,
    startCompanyChat,
    startDirectChat,
  } = useChatConversations();

  const { messages, loading: messagesLoading, connected, sendMessage } =
    useChatSocket({
      conversationId: activeConversationId,
    });

  useEffect(() => {
    requireRole("RECRUITER", router);
  }, [router]);

  useEffect(() => {
    if (!activeCompany) return;
    void startCompanyChat(activeCompany.companyId);
  }, [activeCompany, startCompanyChat]);

  const teamConversations = useMemo(
    () => conversations.filter((item) => item.type === "COMPANY_TEAM"),
    [conversations],
  );

  const directConversations = useMemo(
    () => conversations.filter((item) => item.type === "DIRECT"),
    [conversations],
  );

  const visibleConversations =
    view === "team" ? teamConversations : directConversations;

  const directUnread = useMemo(
    () =>
      directConversations.reduce(
        (sum, item) => sum + (item.unreadCount > 0 ? item.unreadCount : 0),
        0,
      ),
    [directConversations],
  );

  useEffect(() => {
    const candidateUserId = searchParams.get("candidateUserId");
    if (!candidateUserId) return;
    const id = Number(candidateUserId);
    if (!Number.isInteger(id) || id <= 0) return;
    setView("direct");
    void startDirectChat(id, activeCompany?.companyId).then(() => {
      router.replace("/dashboard/recruiter/chat");
    });
  }, [searchParams, startDirectChat, router, activeCompany?.companyId]);

  useEffect(() => {
    if (view === "team") {
      if (teamConversations.length === 0) {
        setActiveConversationId(null);
        return;
      }
      setActiveConversationId((current) => {
        if (
          current &&
          teamConversations.some((item) => item.id === current)
        ) {
          return current;
        }
        return teamConversations[0]?.id ?? null;
      });
      return;
    }

    if (directConversations.length === 0) {
      setActiveConversationId(null);
      return;
    }

    setActiveConversationId((current) => {
      if (
        current &&
        directConversations.some((item) => item.id === current)
      ) {
        return current;
      }
      return directConversations[0]?.id ?? null;
    });
  }, [
    view,
    teamConversations,
    directConversations,
    setActiveConversationId,
  ]);

  if (companyLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <div className="surface-card h-40 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!activeCompany) {
    return <RecruiterSetupNotice />;
  }

  const formatRecruiterDirectTitle = (
    conversation: (typeof directConversations)[number],
  ) => formatDirectChatLabel(conversation, "RECRUITER");

  const paneTitle =
    activeConversation && view === "direct"
      ? formatRecruiterDirectTitle(activeConversation)
      : activeConversation?.title || "Sélectionnez une conversation";
  const paneMeta = activeConversation
    ? view === "team"
      ? `${activeCompany.companyName} · Chat d'équipe`
      : `${activeCompany.companyName} · Discussion candidat`
    : view === "team"
      ? `${activeCompany.companyName} · ${teamConversations.length} canal(aux)`
      : `${directConversations.length} discussion(s) candidate(s)`;

  return (
    <ChatShell
      title="Messagerie"
      subtitle="Collaborez avec votre équipe et échangez directement avec les candidats."
      sidebar={
        <>
          <ChatViewSwitcher
            value={view}
            onChange={setView}
            directCount={directUnread}
          />
          <ChatConnectionBanner connected={connected} />
          {error ? <p className="text-sm text-[#93000a]">{error}</p> : null}
          <ConversationList
            conversations={visibleConversations}
            activeConversationId={activeConversationId}
            onSelect={setActiveConversationId}
            formatTitle={
              view === "direct" ? formatRecruiterDirectTitle : undefined
            }
            emptyMessage={
              view === "team"
                ? "Le canal d'équipe sera disponible dès que votre entreprise est active."
                : "Aucune discussion candidat. Ouvrez une conversation depuis le profil d'un candidat."
            }
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
                {view === "team"
                  ? "Canal d'équipe"
                  : "Discussions candidats"}
              </p>
              <p className="text-sm text-[var(--on-surface-variant)]">
                {view === "team"
                  ? "Sélectionnez le chat d'équipe pour coordonner vos recrutements."
                  : "Ouvrez une discussion depuis le profil d'un candidat dans Candidats."}
              </p>
            </div>
          }
        />
      }
    />
  );
}

export default function RecruiterChatPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
          <div className="surface-card h-40 animate-pulse rounded-3xl" />
        </div>
      }
    >
      <RecruiterChatContent />
    </Suspense>
  );
}
