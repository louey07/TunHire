package com.tunhire.tunhire.chat;

import java.time.Instant;

public record ChatConversationDto(
    Long id,
    ConversationType type,
    Long companyId,
    Long directUserId,
    String title,
    String otherParticipantName,
    String companyName,
    String lastMessage,
    Instant lastMessageAt,
    long unreadCount,
    Instant updatedAt
) {}
