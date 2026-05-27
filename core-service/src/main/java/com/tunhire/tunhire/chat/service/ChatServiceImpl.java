package com.tunhire.tunhire.chat.service;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.chat.ChatConversationDto;
import com.tunhire.tunhire.chat.ChatMessageDto;
import com.tunhire.tunhire.chat.ChatService;
import com.tunhire.tunhire.chat.CompanyMembershipLookup;
import com.tunhire.tunhire.chat.ConversationType;
import com.tunhire.tunhire.chat.RecruiterCandidateEligibility;
import com.tunhire.tunhire.chat.entity.ChatConversation;
import com.tunhire.tunhire.chat.entity.ChatMessage;
import com.tunhire.tunhire.chat.entity.ChatParticipant;
import com.tunhire.tunhire.chat.repository.ChatConversationRepository;
import com.tunhire.tunhire.chat.repository.ChatMessageRepository;
import com.tunhire.tunhire.chat.repository.ChatParticipantRepository;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import com.tunhire.tunhire.companies.repository.CompanyRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;
    private final CompanyMembershipLookup companyMembershipLookup;
    private final RecruiterCandidateEligibility recruiterCandidateEligibility;
    private final AuthService authService;
    private final CompanyRepository companyRepository;
    private final ChatPersistenceSupport chatPersistenceSupport;

    public ChatServiceImpl(
        ChatConversationRepository conversationRepository,
        ChatParticipantRepository participantRepository,
        ChatMessageRepository messageRepository,
        CompanyMembershipLookup companyMembershipLookup,
        RecruiterCandidateEligibility recruiterCandidateEligibility,
        AuthService authService,
        CompanyRepository companyRepository,
        ChatPersistenceSupport chatPersistenceSupport
    ) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
        this.companyMembershipLookup = companyMembershipLookup;
        this.recruiterCandidateEligibility = recruiterCandidateEligibility;
        this.authService = authService;
        this.companyRepository = companyRepository;
        this.chatPersistenceSupport = chatPersistenceSupport;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatConversationDto> listConversations(Long userId) {
        List<ChatParticipant> participants = participantRepository.findByUserIdOrderByJoinedAtDesc(
            userId
        );
        Map<Long, ChatParticipant> uniqueParticipants = new LinkedHashMap<>();
        for (ChatParticipant participant : participants) {
            uniqueParticipants.putIfAbsent(participant.getConversationId(), participant);
        }

        List<ChatConversationDto> result = new ArrayList<>();
        for (ChatParticipant participant : uniqueParticipants.values()) {
            ChatConversation conversation = conversationRepository
                .findById(participant.getConversationId())
                .orElse(null);
            if (conversation == null) {
                continue;
            }
            if (
                conversation.getType() == ConversationType.COMPANY_TEAM &&
                !companyMembershipLookup.isMember(conversation.getCompanyId(), userId)
            ) {
                continue;
            }
            result.add(toConversationDto(conversation, userId));
        }
        result.sort((a, b) -> b.updatedAt().compareTo(a.updatedAt()));
        return result;
    }

    @Override
    public ChatConversationDto getOrCreateCompanyConversation(
        Long companyId,
        Long userId
    ) {
        if (!companyMembershipLookup.isMember(companyId, userId)) {
            throw new IllegalArgumentException(
                "You are not a member of this company."
            );
        }

        ChatConversation conversation = findCompanyConversation(companyId).orElse(null);
        if (conversation == null) {
            conversation = chatPersistenceSupport.insertCompanyConversation(
                companyId,
                userId
            );
        }

        ensureParticipant(conversation.getId(), userId);
        return toConversationDto(conversation, userId);
    }

    @Override
    public ChatConversationDto getOrCreateDirectConversation(
        Long requesterUserId,
        Long targetUserId,
        Long companyId
    ) {
        if (targetUserId == null) {
            throw new IllegalArgumentException("targetUserId is required.");
        }
        if (requesterUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot message yourself.");
        }
        if (
            !recruiterCandidateEligibility.canStartDirectChat(
                requesterUserId,
                targetUserId
            )
        ) {
            throw new IllegalArgumentException(
                "Only recruiters can start a direct conversation with a candidate."
            );
        }
        if (companyId != null && !companyMembershipLookup.isMember(companyId, requesterUserId)) {
            throw new IllegalArgumentException(
                "You are not a member of this company."
            );
        }

        long lowId = Math.min(requesterUserId, targetUserId);
        long highId = Math.max(requesterUserId, targetUserId);

        ChatConversation conversation = findDirectConversation(lowId, highId).orElse(null);
        if (conversation == null) {
            conversation = chatPersistenceSupport.insertDirectConversation(
                requesterUserId,
                lowId,
                highId,
                companyId
            );
        }

        ensureParticipant(conversation.getId(), requesterUserId);
        ensureParticipant(conversation.getId(), targetUserId);
        return toConversationDto(conversation, requesterUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessages(
        Long conversationId,
        Long userId,
        Instant before,
        int size
    ) {
        ChatConversation conversation = requireAccessibleConversation(
            conversationId,
            userId
        );
        int pageSize = Math.max(1, Math.min(size, 100));
        List<ChatMessage> rows = before == null
            ? messageRepository.findByConversationIdOrderByCreatedAtDesc(
                conversationId,
                PageRequest.of(0, pageSize)
            )
            : messageRepository.findByConversationIdAndCreatedAtBeforeOrderByCreatedAtDesc(
                conversationId,
                before,
                PageRequest.of(0, pageSize)
            );

        Map<Long, String[]> senderNames = new HashMap<>();
        List<ChatMessageDto> out = new ArrayList<>();
        for (int i = rows.size() - 1; i >= 0; i--) {
            ChatMessage message = rows.get(i);
            String[] sender = senderNames.computeIfAbsent(
                message.getSenderUserId(),
                id -> {
                    var user = authService.getUserById(id);
                    return new String[] { user.firstName(), user.lastName() };
                }
            );
            out.add(
                new ChatMessageDto(
                    message.getId(),
                    message.getConversationId(),
                    message.getSenderUserId(),
                    sender[0],
                    sender[1],
                    message.getBody(),
                    message.getCreatedAt(),
                    message.getEditedAt(),
                    message.isDeleted()
                )
            );
        }

        if (conversation.getType() == ConversationType.COMPANY_TEAM) {
            ensureParticipant(conversationId, userId);
        }
        return out;
    }

    @Override
    public void markConversationAsRead(Long conversationId, Long userId) {
        ChatConversation conversation = requireAccessibleConversation(
            conversationId,
            userId
        );
        ChatParticipant participant = findParticipant(conversation.getId(), userId)
            .orElseGet(() -> ensureParticipant(conversation.getId(), userId));
        participant.setLastReadAt(Instant.now());
        participantRepository.save(participant);
    }

    @Override
    public ChatMessageDto sendMessage(
        Long conversationId,
        Long senderUserId,
        String body
    ) {
        ChatConversation conversation = requireAccessibleConversation(
            conversationId,
            senderUserId
        );
        String normalized = body == null ? "" : body.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }
        if (normalized.length() > 2000) {
            throw new IllegalArgumentException(
                "Message cannot exceed 2000 characters."
            );
        }

        ChatParticipant participant = findParticipant(conversationId, senderUserId)
            .orElseGet(() -> ensureParticipant(conversationId, senderUserId));
        participant.setLastReadAt(Instant.now());
        participantRepository.save(participant);

        ChatMessage message = messageRepository.save(
            ChatMessage
                .builder()
                .conversationId(conversationId)
                .senderUserId(senderUserId)
                .body(normalized)
                .build()
        );

        conversation.setUpdatedAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        var sender = authService.getUserById(senderUserId);
        return new ChatMessageDto(
            message.getId(),
            message.getConversationId(),
            message.getSenderUserId(),
            sender.firstName(),
            sender.lastName(),
            message.getBody(),
            message.getCreatedAt(),
            message.getEditedAt(),
            message.isDeleted()
        );
    }

    private ChatConversationDto toConversationDto(
        ChatConversation conversation,
        Long currentUserId
    ) {
        ChatMessage lastMessage = messageRepository
            .findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId())
            .orElse(null);
        ChatParticipant currentParticipant = findParticipant(
            conversation.getId(),
            currentUserId
        ).orElse(null);
        Instant lastReadAt = currentParticipant != null &&
            currentParticipant.getLastReadAt() != null
            ? currentParticipant.getLastReadAt()
            : Instant.EPOCH;

        long unreadCount = messageRepository.countByConversationIdAndCreatedAtAfterAndSenderUserIdNot(
            conversation.getId(),
            lastReadAt,
            currentUserId
        );

        Long directUserId = null;
        String otherParticipantName = null;
        String title;
        String companyName = resolveCompanyName(conversation.getCompanyId());

        if (conversation.getType() == ConversationType.COMPANY_TEAM) {
            title = companyName != null
                ? "Équipe " + companyName
                : "Équipe entreprise #" + conversation.getCompanyId();
        } else {
            ChatParticipant other = findOtherParticipant(
                conversation.getId(),
                currentUserId
            ).orElseThrow(() ->
                new ResourceNotFoundException("Conversation participant not found.")
            );
            directUserId = other.getUserId();
            var user = authService.getUserById(other.getUserId());
            otherParticipantName = (user.firstName() + " " + user.lastName()).trim();
            title = otherParticipantName;
        }

        return new ChatConversationDto(
            conversation.getId(),
            conversation.getType(),
            conversation.getCompanyId(),
            directUserId,
            title,
            otherParticipantName,
            companyName,
            lastMessage != null ? lastMessage.getBody() : null,
            lastMessage != null ? lastMessage.getCreatedAt() : null,
            unreadCount,
            conversation.getUpdatedAt()
        );
    }

    private String resolveCompanyName(Long companyId) {
        if (companyId == null) {
            return null;
        }
        return companyRepository
            .findById(companyId)
            .map(company -> company.getName())
            .orElse(null);
    }

    private Optional<ChatConversation> findCompanyConversation(Long companyId) {
        return conversationRepository.findFirstByTypeAndCompanyIdOrderByIdAsc(
            ConversationType.COMPANY_TEAM,
            companyId
        );
    }

    private Optional<ChatConversation> findDirectConversation(
        long lowId,
        long highId
    ) {
        return conversationRepository.findFirstByTypeAndDirectUserLowIdAndDirectUserHighIdOrderByIdAsc(
            ConversationType.DIRECT,
            lowId,
            highId
        );
    }

    private Optional<ChatParticipant> findParticipant(
        Long conversationId,
        Long userId
    ) {
        return participantRepository.findFirstByConversationIdAndUserIdOrderByIdAsc(
            conversationId,
            userId
        );
    }

    private Optional<ChatParticipant> findOtherParticipant(
        Long conversationId,
        Long currentUserId
    ) {
        return participantRepository.findFirstByConversationIdAndUserIdNotOrderByIdAsc(
            conversationId,
            currentUserId
        );
    }

    private ChatConversation requireAccessibleConversation(
        Long conversationId,
        Long userId
    ) {
        ChatConversation conversation = conversationRepository
            .findById(conversationId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Conversation not found.")
            );

        if (conversation.getType() == ConversationType.COMPANY_TEAM) {
            if (
                !companyMembershipLookup.isMember(conversation.getCompanyId(), userId)
            ) {
                throw new ResourceNotFoundException("Conversation not found.");
            }
            return conversation;
        }

        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new ResourceNotFoundException("Conversation not found.");
        }
        return conversation;
    }

    private ChatParticipant ensureParticipant(Long conversationId, Long userId) {
        return findParticipant(conversationId, userId).orElseGet(() ->
            chatPersistenceSupport.insertParticipant(conversationId, userId)
        );
    }
}
