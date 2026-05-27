"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listConversations,
  openCompanyConversation,
  openDirectConversation,
} from "@/lib/chat/api";
import type { ChatConversation } from "@/lib/types";

export function useChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listConversations();
    if (!res.success) {
      setError(res.message || "Impossible de charger les conversations.");
      setConversations([]);
      setLoading(false);
      return;
    }
    const rows = (res.data || []).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    setConversations(rows);
    setActiveConversationId((current) =>
      current && rows.some((row) => row.id === current)
        ? current
        : rows[0]?.id ?? null,
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const startCompanyChat = useCallback(
    async (companyId: number) => {
      const res = await openCompanyConversation(companyId);
      if (!res.success || !res.data) {
        setError(res.message || "Impossible d'ouvrir le chat d'équipe.");
        return null;
      }
      setConversations((prev) => {
        const without = prev.filter((item) => item.id !== res.data!.id);
        return [res.data!, ...without];
      });
      setActiveConversationId(res.data.id);
      return res.data;
    },
    [],
  );

  const startDirectChat = useCallback(
    async (targetUserId: number, companyId?: number) => {
      const res = await openDirectConversation(targetUserId, companyId);
      if (!res.success || !res.data) {
        setError(res.message || "Impossible d'ouvrir la discussion directe.");
        return null;
      }
      setConversations((prev) => {
        const without = prev.filter((item) => item.id !== res.data!.id);
        return [res.data!, ...without];
      });
      setActiveConversationId(res.data.id);
      return res.data;
    },
    [],
  );

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    loading,
    error,
    refresh,
    startCompanyChat,
    startDirectChat,
  };
}
