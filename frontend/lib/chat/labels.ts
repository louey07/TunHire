import type { ChatConversation } from "@/lib/types";

export function formatDirectChatLabel(
  conversation: ChatConversation,
  viewerRole: "CANDIDATE" | "RECRUITER",
): string {
  const participantName =
    conversation.otherParticipantName?.trim() || conversation.title;

  if (viewerRole === "CANDIDATE" && conversation.companyName) {
    return `${participantName} — ${conversation.companyName}`;
  }

  return participantName;
}

export function formatConversationTitle(
  conversation: ChatConversation,
  viewerRole: "CANDIDATE" | "RECRUITER",
): string {
  if (conversation.type === "DIRECT") {
    return formatDirectChatLabel(conversation, viewerRole);
  }

  if (conversation.companyName) {
    return conversation.companyName;
  }

  return conversation.title;
}
