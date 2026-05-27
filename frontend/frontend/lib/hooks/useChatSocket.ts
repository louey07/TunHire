"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  getConversationMessages,
  markConversationRead,
} from "@/lib/chat/api";
import type { ChatMessage } from "@/lib/types";

type UseChatSocketOptions = {
  conversationId: number | null;
};

export function useChatSocket({ conversationId }: UseChatSocketOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (clientRef.current) return;
    const token = getToken();
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      reconnectDelay: 3000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => undefined,
    });

    client.onConnect = () => {
      setConnected(true);
      if (conversationId != null) {
        client.subscribe(
          `/topic/chat/conversations/${conversationId}`,
          (frame) => {
            try {
              const message = JSON.parse(frame.body) as ChatMessage;
              setMessages((prev) => [...prev, message]);
            } catch {
              /* ignore malformed payload */
            }
          },
        );
      }
    };

    client.onStompError = (frame) => {
      setError(frame.headers.message || "Erreur websocket.");
    };

    client.onWebSocketClose = () => {
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;
  }, [conversationId]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnected(false);
  }, []);

  const reloadMessages = useCallback(async () => {
    if (conversationId == null) {
      setMessages([]);
      return;
    }
    setLoading(true);
    setError("");
    const res = await getConversationMessages(conversationId);
    if (!res.success) {
      setError(res.message || "Impossible de charger les messages.");
      setMessages([]);
      setLoading(false);
      return;
    }
    setMessages(res.data || []);
    setLoading(false);
    await markConversationRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    void reloadMessages();
  }, [reloadMessages]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const sendMessage = useCallback(
    (body: string) => {
      if (!clientRef.current || !connected || conversationId == null) return;
      clientRef.current.publish({
        destination: `/app/chat/conversations/${conversationId}/send`,
        body: JSON.stringify({ body }),
      });
    },
    [connected, conversationId],
  );

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages],
  );

  return {
    messages: sortedMessages,
    loading,
    error,
    connected,
    sendMessage,
    reloadMessages,
  };
}
