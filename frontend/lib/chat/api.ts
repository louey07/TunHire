import { apiGet, apiPost } from "@/lib/api";
import type { ChatConversation, ChatMessage } from "@/lib/types";

export async function listConversations() {
  return apiGet<ChatConversation[]>("/chat/conversations");
}

export async function openCompanyConversation(companyId: number) {
  return apiPost<ChatConversation>(`/chat/conversations/company/${companyId}`);
}

export async function openDirectConversation(
  targetUserId: number,
  companyId?: number,
) {
  return apiPost<ChatConversation>("/chat/conversations/direct", {
    targetUserId,
    companyId: companyId ?? null,
  });
}

export async function getConversationMessages(
  conversationId: number,
  before?: string,
  size = 30,
) {
  const query = new URLSearchParams();
  query.set("size", String(size));
  if (before) query.set("before", before);
  return apiGet<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages?${query.toString()}`,
  );
}

export async function markConversationRead(conversationId: number) {
  return apiPost<void>(`/chat/conversations/${conversationId}/read`);
}
