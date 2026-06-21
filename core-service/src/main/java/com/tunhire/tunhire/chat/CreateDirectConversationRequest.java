package com.tunhire.tunhire.chat;

public record CreateDirectConversationRequest(
    Long targetUserId,
    Long companyId
) {}
