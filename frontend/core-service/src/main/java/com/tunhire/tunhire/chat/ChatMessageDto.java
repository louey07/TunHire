package com.tunhire.tunhire.chat;

import java.time.Instant;

public record ChatMessageDto(
    Long id,
    Long conversationId,
    Long senderUserId,
    String senderFirstName,
    String senderLastName,
    String body,
    Instant createdAt,
    Instant editedAt,
    boolean deleted
) {}
