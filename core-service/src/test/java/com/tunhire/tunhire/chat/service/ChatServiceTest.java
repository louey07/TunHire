package com.tunhire.tunhire.chat.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.auth.UserDto;
import com.tunhire.tunhire.auth.entity.Role;
import com.tunhire.tunhire.chat.CompanyMembershipLookup;
import com.tunhire.tunhire.chat.ConversationType;
import com.tunhire.tunhire.chat.RecruiterCandidateEligibility;
import com.tunhire.tunhire.chat.entity.ChatConversation;
import com.tunhire.tunhire.chat.entity.ChatMessage;
import com.tunhire.tunhire.chat.entity.ChatParticipant;
import com.tunhire.tunhire.chat.repository.ChatConversationRepository;
import com.tunhire.tunhire.chat.repository.ChatMessageRepository;
import com.tunhire.tunhire.chat.repository.ChatParticipantRepository;
import com.tunhire.tunhire.companies.entity.Company;
import com.tunhire.tunhire.companies.repository.CompanyRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatConversationRepository conversationRepository;

    @Mock
    private ChatParticipantRepository participantRepository;

    @Mock
    private ChatMessageRepository messageRepository;

    @Mock
    private CompanyMembershipLookup companyMembershipLookup;

    @Mock
    private RecruiterCandidateEligibility recruiterCandidateEligibility;

    @Mock
    private AuthService authService;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private ChatPersistenceSupport chatPersistenceSupport;

    @InjectMocks
    private ChatServiceImpl chatService;

    @Test
    void companyConversationRequiresMembership() {
        when(companyMembershipLookup.isMember(7L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> chatService.getOrCreateCompanyConversation(7L, 1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not a member");
    }

    @Test
    void directConversationRequiresRecruiterCandidateEligibility() {
        when(recruiterCandidateEligibility.canStartDirectChat(1L, 2L))
            .thenReturn(false);

        assertThatThrownBy(() -> chatService.getOrCreateDirectConversation(1L, 2L, 7L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Only recruiters");
    }

    @Test
    void getOrCreateDirectConversationReturnsExistingConversation() {
        ChatConversation existing = directConversation(10L, 1L, 2L, 7L);
        when(recruiterCandidateEligibility.canStartDirectChat(1L, 2L)).thenReturn(true);
        when(companyMembershipLookup.isMember(7L, 1L)).thenReturn(true);
        when(
            conversationRepository.findFirstByTypeAndDirectUserLowIdAndDirectUserHighIdOrderByIdAsc(
                ConversationType.DIRECT,
                1L,
                2L
            )
        ).thenReturn(Optional.of(existing));
        stubParticipantAndDto(existing, 1L, 2L);

        var first = chatService.getOrCreateDirectConversation(1L, 2L, 7L);
        var second = chatService.getOrCreateDirectConversation(1L, 2L, 7L);

        assertThat(first.id()).isEqualTo(10L);
        assertThat(second.id()).isEqualTo(10L);
        verify(chatPersistenceSupport, never()).insertDirectConversation(
            any(),
            any(Long.class),
            any(Long.class),
            any()
        );
    }

    @Test
    void getOrCreateDirectConversationStoresCompanyOnFirstCreate() {
        ChatConversation created = directConversation(10L, 1L, 2L, 7L);
        when(recruiterCandidateEligibility.canStartDirectChat(1L, 2L)).thenReturn(true);
        when(companyMembershipLookup.isMember(7L, 1L)).thenReturn(true);
        when(
            conversationRepository.findFirstByTypeAndDirectUserLowIdAndDirectUserHighIdOrderByIdAsc(
                ConversationType.DIRECT,
                1L,
                2L
            )
        ).thenReturn(Optional.empty());
        when(chatPersistenceSupport.insertDirectConversation(1L, 1L, 2L, 7L))
            .thenReturn(created);
        stubParticipantAndDto(created, 1L, 2L);

        chatService.getOrCreateDirectConversation(1L, 2L, 7L);

        verify(chatPersistenceSupport).insertDirectConversation(1L, 1L, 2L, 7L);
    }

    @Test
    void getOrCreateDirectConversationFallsBackAfterConstraintViolation() {
        ChatConversation existing = directConversation(10L, 1L, 2L, 7L);
        when(recruiterCandidateEligibility.canStartDirectChat(1L, 2L)).thenReturn(true);
        when(companyMembershipLookup.isMember(7L, 1L)).thenReturn(true);
        when(
            conversationRepository.findFirstByTypeAndDirectUserLowIdAndDirectUserHighIdOrderByIdAsc(
                ConversationType.DIRECT,
                1L,
                2L
            )
        ).thenReturn(Optional.empty());
        when(chatPersistenceSupport.insertDirectConversation(1L, 1L, 2L, 7L))
            .thenReturn(existing);
        stubParticipantAndDto(existing, 1L, 2L);

        var result = chatService.getOrCreateDirectConversation(1L, 2L, 7L);

        assertThat(result.id()).isEqualTo(10L);
        verify(chatPersistenceSupport).insertDirectConversation(1L, 1L, 2L, 7L);
    }

    @Test
    void listConversationsDedupesDuplicateParticipantRows() {
        ChatParticipant duplicate = participant(1L, 20L, 1L);
        ChatParticipant kept = participant(2L, 20L, 1L);
        ChatConversation conversation = directConversation(20L, 1L, 2L, 7L);

        when(participantRepository.findByUserIdOrderByJoinedAtDesc(1L))
            .thenReturn(List.of(duplicate, kept));
        when(conversationRepository.findById(20L)).thenReturn(Optional.of(conversation));
        when(
            participantRepository.findFirstByConversationIdAndUserIdOrderByIdAsc(20L, 1L)
        ).thenReturn(Optional.of(participant(1L, 20L, 1L)));
        when(
            participantRepository.findFirstByConversationIdAndUserIdNotOrderByIdAsc(20L, 1L)
        ).thenReturn(Optional.of(participant(101L, 20L, 2L)));
        when(messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(20L))
            .thenReturn(Optional.empty());
        when(
            messageRepository.countByConversationIdAndCreatedAtAfterAndSenderUserIdNot(
                any(),
                any(),
                any()
            )
        ).thenReturn(0L);
        when(authService.getUserById(2L)).thenReturn(
            new UserDto(
                2L,
                "c@test.com",
                "Candidate",
                "Two",
                null,
                Role.CANDIDATE,
                Instant.now()
            )
        );
        when(companyRepository.findById(7L)).thenReturn(
            Optional.of(
                Company.builder().id(7L).name("Telecom").slug("telecom").build()
            )
        );

        var result = chatService.listConversations(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(20L);
        assertThat(result.get(0).otherParticipantName()).isEqualTo("Candidate Two");
        assertThat(result.get(0).companyName()).isEqualTo("Telecom");
    }

    @Test
    void sendMessagePersistsAndReturnsPayload() {
        ChatConversation conversation = ChatConversation
            .builder()
            .id(10L)
            .type(ConversationType.DIRECT)
            .directUserLowId(1L)
            .directUserHighId(2L)
            .companyId(null)
            .createdByUserId(1L)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        when(conversationRepository.findById(10L)).thenReturn(
            Optional.of(conversation)
        );
        when(participantRepository.existsByConversationIdAndUserId(10L, 1L))
            .thenReturn(true);
        when(
            participantRepository.findFirstByConversationIdAndUserIdOrderByIdAsc(10L, 1L)
        )
            .thenReturn(
                Optional.of(
                    ChatParticipant
                        .builder()
                        .id(99L)
                        .conversationId(10L)
                        .userId(1L)
                        .joinedAt(Instant.now())
                        .lastReadAt(Instant.now())
                        .build()
                )
            );
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(55L);
            message.setCreatedAt(Instant.now());
            return message;
        });
        when(authService.getUserById(1L)).thenReturn(
            new UserDto(1L, "a@test.com", "Rec", "One", null, Role.RECRUITER, Instant.now())
        );

        var result = chatService.sendMessage(10L, 1L, "hello");

        assertThat(result.id()).isEqualTo(55L);
        assertThat(result.conversationId()).isEqualTo(10L);
        assertThat(result.body()).isEqualTo("hello");
        assertThat(result.senderFirstName()).isEqualTo("Rec");
    }

    private ChatConversation directConversation(
        Long id,
        long lowId,
        long highId,
        Long companyId
    ) {
        return ChatConversation
            .builder()
            .id(id)
            .type(ConversationType.DIRECT)
            .directUserLowId(lowId)
            .directUserHighId(highId)
            .companyId(companyId)
            .createdByUserId(lowId)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }

    private ChatParticipant participant(Long id, Long conversationId, Long userId) {
        return ChatParticipant
            .builder()
            .id(id)
            .conversationId(conversationId)
            .userId(userId)
            .joinedAt(Instant.now())
            .lastReadAt(Instant.now())
            .build();
    }

    private void stubParticipantAndDto(
        ChatConversation conversation,
        long recruiterId,
        long candidateId
    ) {
        when(
            participantRepository.findFirstByConversationIdAndUserIdOrderByIdAsc(
                conversation.getId(),
                recruiterId
            )
        ).thenReturn(
            Optional.of(participant(100L, conversation.getId(), recruiterId))
        );
        when(
            participantRepository.findFirstByConversationIdAndUserIdNotOrderByIdAsc(
                conversation.getId(),
                recruiterId
            )
        ).thenReturn(
            Optional.of(participant(101L, conversation.getId(), candidateId))
        );
        when(messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId()))
            .thenReturn(Optional.empty());
        when(
            messageRepository.countByConversationIdAndCreatedAtAfterAndSenderUserIdNot(
                any(),
                any(),
                any()
            )
        ).thenReturn(0L);
        when(authService.getUserById(candidateId)).thenReturn(
            new UserDto(
                candidateId,
                "c@test.com",
                "Candidate",
                "Two",
                null,
                Role.CANDIDATE,
                Instant.now()
            )
        );
        when(companyRepository.findById(7L)).thenReturn(
            Optional.of(
                Company.builder().id(7L).name("Telecom").slug("telecom").build()
            )
        );
        when(
            participantRepository.findFirstByConversationIdAndUserIdOrderByIdAsc(
                conversation.getId(),
                candidateId
            )
        ).thenReturn(Optional.empty());
        when(chatPersistenceSupport.insertParticipant(conversation.getId(), candidateId))
            .thenReturn(participant(200L, conversation.getId(), candidateId));
    }
}
