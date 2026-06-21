package com.tunhire.tunhire.notifications;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tunhire.tunhire.applications.JobLookupService;
import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.auth.entity.Role;
import com.tunhire.tunhire.chat.ChatService;
import com.tunhire.tunhire.chat.CompanyMembershipLookup;
import com.tunhire.tunhire.notifications.entity.CandidateApplicationView;
import com.tunhire.tunhire.notifications.entity.CandidateApplicationViewId;
import com.tunhire.tunhire.notifications.entity.RecruiterInboxState;
import com.tunhire.tunhire.notifications.entity.RecruiterInboxStateId;
import com.tunhire.tunhire.notifications.repository.RecruiterInboxStateRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private ChatService chatService;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobLookupService jobLookupService;

    @Mock
    private RecruiterInboxStateRepository recruiterInboxStateRepository;

    @Mock
    private CandidateApplicationViewService candidateApplicationViewService;

    @Mock
    private CompanyMembershipLookup companyMembershipLookup;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void getBadgesForRecruiterWithNoInboxInitializesAndReturnsZeroNewApplications() {
        when(chatService.countTotalUnread(10L)).thenReturn(2L);
        when(companyMembershipLookup.isMember(5L, 10L)).thenReturn(true);
        when(recruiterInboxStateRepository.findById(any(RecruiterInboxStateId.class)))
            .thenReturn(Optional.empty());
        when(recruiterInboxStateRepository.save(any(RecruiterInboxState.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationBadgesDto badges = notificationService.getBadges(
            10L,
            Role.RECRUITER,
            5L
        );

        assertThat(badges.chatUnread()).isEqualTo(2);
        assertThat(badges.newApplications()).isZero();
        assertThat(badges.applicationUpdates()).isZero();
        verify(recruiterInboxStateRepository).save(any(RecruiterInboxState.class));
        verify(applicationRepository, never()).countByJobIdInAndCreatedAtAfter(any(), any());
    }

    @Test
    void getBadgesForRecruiterCountsApplicationsAfterLastSeen() {
        Instant seenAt = Instant.parse("2026-01-01T00:00:00Z");
        RecruiterInboxStateId inboxId = new RecruiterInboxStateId(10L, 5L);
        RecruiterInboxState inbox = RecruiterInboxState.builder()
            .id(inboxId)
            .applicationsSeenAt(seenAt)
            .build();

        when(chatService.countTotalUnread(10L)).thenReturn(0L);
        when(companyMembershipLookup.isMember(5L, 10L)).thenReturn(true);
        when(recruiterInboxStateRepository.findById(inboxId)).thenReturn(Optional.of(inbox));
        when(jobLookupService.getJobIdsByCompanyId(5L)).thenReturn(List.of(100L, 101L));
        when(
            applicationRepository.countByJobIdInAndCreatedAtAfter(
                List.of(100L, 101L),
                seenAt
            )
        ).thenReturn(3L);

        NotificationBadgesDto badges = notificationService.getBadges(
            10L,
            Role.RECRUITER,
            5L
        );

        assertThat(badges.newApplications()).isEqualTo(3);
    }

    @Test
    void getBadgesForCandidateReturnsApplicationUpdates() {
        when(chatService.countTotalUnread(20L)).thenReturn(1L);
        when(candidateApplicationViewService.countStatusUpdates(20L)).thenReturn(2L);

        NotificationBadgesDto badges = notificationService.getBadges(
            20L,
            Role.CANDIDATE,
            null
        );

        assertThat(badges.chatUnread()).isEqualTo(1);
        assertThat(badges.newApplications()).isZero();
        assertThat(badges.applicationUpdates()).isEqualTo(2);
    }

    @Test
    void markRecruiterCandidatesSeenUpsertsInboxState() {
        when(companyMembershipLookup.isMember(5L, 10L)).thenReturn(true);
        when(recruiterInboxStateRepository.findById(any(RecruiterInboxStateId.class)))
            .thenReturn(Optional.empty());
        when(recruiterInboxStateRepository.save(any(RecruiterInboxState.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.markRecruiterCandidatesSeen(10L, 5L);

        ArgumentCaptor<RecruiterInboxState> captor =
            ArgumentCaptor.forClass(RecruiterInboxState.class);
        verify(recruiterInboxStateRepository).save(captor.capture());
        assertThat(captor.getValue().getId().getUserId()).isEqualTo(10L);
        assertThat(captor.getValue().getId().getCompanyId()).isEqualTo(5L);
        assertThat(captor.getValue().getApplicationsSeenAt()).isNotNull();
    }

    @Test
    void markRecruiterCandidatesSeenRejectsNonMember() {
        when(companyMembershipLookup.isMember(5L, 10L)).thenReturn(false);

        assertThatThrownBy(() ->
            notificationService.markRecruiterCandidatesSeen(10L, 5L)
        ).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void markCandidateApplicationsSeenDelegatesToViewService() {
        notificationService.markCandidateApplicationsSeen(20L);
        verify(candidateApplicationViewService).syncAllViewsForCandidate(20L);
    }
}
