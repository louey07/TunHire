package com.tunhire.tunhire.chat.repository;

import com.tunhire.tunhire.chat.ConversationType;
import com.tunhire.tunhire.chat.entity.ChatConversation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatConversationRepository
    extends JpaRepository<ChatConversation, Long> {
    Optional<ChatConversation> findFirstByTypeAndCompanyIdOrderByIdAsc(
        ConversationType type,
        Long companyId
    );

    Optional<ChatConversation> findFirstByTypeAndDirectUserLowIdAndDirectUserHighIdOrderByIdAsc(
        ConversationType type,
        Long directUserLowId,
        Long directUserHighId
    );
}
