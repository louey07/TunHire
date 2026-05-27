package com.tunhire.tunhire.chat.repository;

import com.tunhire.tunhire.chat.entity.ChatParticipant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatParticipantRepository
    extends JpaRepository<ChatParticipant, Long> {
    List<ChatParticipant> findByUserIdOrderByJoinedAtDesc(Long userId);

    Optional<ChatParticipant> findFirstByConversationIdAndUserIdOrderByIdAsc(
        Long conversationId,
        Long userId
    );

    Optional<ChatParticipant> findFirstByConversationIdAndUserIdNotOrderByIdAsc(
        Long conversationId,
        Long userId
    );

    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);

    List<ChatParticipant> findByConversationId(Long conversationId);
}
