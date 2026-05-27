package com.tunhire.tunhire.chat.service;

import com.tunhire.tunhire.chat.ConversationType;
import com.tunhire.tunhire.chat.entity.ChatConversation;
import com.tunhire.tunhire.chat.entity.ChatParticipant;
import com.tunhire.tunhire.chat.repository.ChatConversationRepository;
import com.tunhire.tunhire.chat.repository.ChatParticipantRepository;
import jakarta.persistence.EntityManager;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ChatPersistenceSupport {

    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;
    private final EntityManager entityManager;

    public ChatPersistenceSupport(
        ChatConversationRepository conversationRepository,
        ChatParticipantRepository participantRepository,
        EntityManager entityManager
    ) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.entityManager = entityManager;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ChatConversation insertCompanyConversation(Long companyId, Long userId) {
        Optional<ChatConversation> existing = conversationRepository.findFirstByTypeAndCompanyIdOrderByIdAsc(
            ConversationType.COMPANY_TEAM,
            companyId
        );
        if (existing.isPresent()) {
            return existing.get();
        }

        try {
            return conversationRepository.save(
                ChatConversation
                    .builder()
                    .type(ConversationType.COMPANY_TEAM)
                    .companyId(companyId)
                    .createdByUserId(userId)
                    .build()
            );
        } catch (DataIntegrityViolationException ex) {
            entityManager.clear();
            return conversationRepository.findFirstByTypeAndCompanyIdOrderByIdAsc(
                ConversationType.COMPANY_TEAM,
                companyId
            ).orElseThrow(() -> ex);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ChatConversation insertDirectConversation(
        Long requesterUserId,
        long lowId,
        long highId,
        Long companyId
    ) {
        Optional<ChatConversation> existing =
            conversationRepository.findFirstByTypeAndDirectUserLowIdAndDirectUserHighIdOrderByIdAsc(
                ConversationType.DIRECT,
                lowId,
                highId
            );
        if (existing.isPresent()) {
            return existing.get();
        }

        try {
            return conversationRepository.save(
                ChatConversation
                    .builder()
                    .type(ConversationType.DIRECT)
                    .directUserLowId(lowId)
                    .directUserHighId(highId)
                    .companyId(companyId)
                    .createdByUserId(requesterUserId)
                    .build()
            );
        } catch (DataIntegrityViolationException ex) {
            entityManager.clear();
            return conversationRepository.findFirstByTypeAndDirectUserLowIdAndDirectUserHighIdOrderByIdAsc(
                ConversationType.DIRECT,
                lowId,
                highId
            ).orElseThrow(() -> ex);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ChatParticipant insertParticipant(Long conversationId, Long userId) {
        Optional<ChatParticipant> existing =
            participantRepository.findFirstByConversationIdAndUserIdOrderByIdAsc(
                conversationId,
                userId
            );
        if (existing.isPresent()) {
            return existing.get();
        }

        try {
            return participantRepository.save(
                ChatParticipant
                    .builder()
                    .conversationId(conversationId)
                    .userId(userId)
                    .build()
            );
        } catch (DataIntegrityViolationException ex) {
            entityManager.clear();
            return participantRepository.findFirstByConversationIdAndUserIdOrderByIdAsc(
                conversationId,
                userId
            ).orElseThrow(() -> ex);
        }
    }
}
