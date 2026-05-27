package com.tunhire.tunhire.chat;

import java.time.Instant;
import java.util.List;

public interface ChatService {
    List<ChatConversationDto> listConversations(Long userId);

    ChatConversationDto getOrCreateCompanyConversation(Long companyId, Long userId);

    ChatConversationDto getOrCreateDirectConversation(
        Long requesterUserId,
        Long targetUserId,
        Long companyId
    );

    List<ChatMessageDto> getMessages(
        Long conversationId,
        Long userId,
        Instant before,
        int size
    );

    void markConversationAsRead(Long conversationId, Long userId);

    ChatMessageDto sendMessage(Long conversationId, Long senderUserId, String body);
}
