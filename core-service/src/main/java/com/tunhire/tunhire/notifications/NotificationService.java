package com.tunhire.tunhire.notifications;

import com.tunhire.tunhire.applications.JobLookupService;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.auth.entity.Role;
import com.tunhire.tunhire.chat.ChatService;
import com.tunhire.tunhire.chat.CompanyMembershipLookup;
import com.tunhire.tunhire.notifications.entity.RecruiterInboxState;
import com.tunhire.tunhire.notifications.entity.RecruiterInboxStateId;
import com.tunhire.tunhire.notifications.repository.RecruiterInboxStateRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService {

    private final ChatService chatService;
    private final ApplicationRepository applicationRepository;
    private final JobLookupService jobLookupService;
    private final RecruiterInboxStateRepository recruiterInboxStateRepository;
    private final CandidateApplicationViewService candidateApplicationViewService;
    private final CompanyMembershipLookup companyMembershipLookup;

    public NotificationService(
        ChatService chatService,
        ApplicationRepository applicationRepository,
        JobLookupService jobLookupService,
        RecruiterInboxStateRepository recruiterInboxStateRepository,
        CandidateApplicationViewService candidateApplicationViewService,
        CompanyMembershipLookup companyMembershipLookup
    ) {
        this.chatService = chatService;
        this.applicationRepository = applicationRepository;
        this.jobLookupService = jobLookupService;
        this.recruiterInboxStateRepository = recruiterInboxStateRepository;
        this.candidateApplicationViewService = candidateApplicationViewService;
        this.companyMembershipLookup = companyMembershipLookup;
    }

    @Transactional(readOnly = true)
    public NotificationBadgesDto getBadges(Long userId, Role role, Long companyId) {
        long chatUnread = chatService.countTotalUnread(userId);

        if (role == Role.CANDIDATE) {
            long applicationUpdates =
                candidateApplicationViewService.countStatusUpdates(userId);
            return new NotificationBadgesDto(chatUnread, 0, applicationUpdates);
        }

        if (companyId == null) {
            throw new IllegalArgumentException("companyId is required for recruiters");
        }
        ensureCompanyMember(companyId, userId);

        long newApplications = countNewApplications(userId, companyId);
        return new NotificationBadgesDto(chatUnread, newApplications, 0);
    }

    public void markRecruiterCandidatesSeen(Long userId, Long companyId) {
        ensureCompanyMember(companyId, userId);
        upsertRecruiterInboxState(userId, companyId, Instant.now());
    }

    public void markCandidateApplicationsSeen(Long userId) {
        candidateApplicationViewService.syncAllViewsForCandidate(userId);
    }

    private long countNewApplications(Long userId, Long companyId) {
        RecruiterInboxStateId inboxId = new RecruiterInboxStateId(userId, companyId);
        Optional<RecruiterInboxState> inboxState =
            recruiterInboxStateRepository.findById(inboxId);

        if (inboxState.isEmpty()) {
            upsertRecruiterInboxState(userId, companyId, Instant.now());
            return 0;
        }

        Instant seenAt = inboxState.get().getApplicationsSeenAt();
        List<Long> jobIds = jobLookupService.getJobIdsByCompanyId(companyId);
        if (jobIds == null || jobIds.isEmpty()) {
            return 0;
        }
        return applicationRepository.countByJobIdInAndCreatedAtAfter(jobIds, seenAt);
    }

    private void upsertRecruiterInboxState(
        Long userId,
        Long companyId,
        Instant seenAt
    ) {
        RecruiterInboxStateId inboxId = new RecruiterInboxStateId(userId, companyId);
        RecruiterInboxState state = recruiterInboxStateRepository
            .findById(inboxId)
            .orElse(
                RecruiterInboxState.builder()
                    .id(inboxId)
                    .build()
            );
        state.setApplicationsSeenAt(seenAt);
        recruiterInboxStateRepository.save(state);
    }

    private void ensureCompanyMember(Long companyId, Long userId) {
        if (!companyMembershipLookup.isMember(companyId, userId)) {
            throw new IllegalArgumentException(
                "You do not have access to this company"
            );
        }
    }
}
