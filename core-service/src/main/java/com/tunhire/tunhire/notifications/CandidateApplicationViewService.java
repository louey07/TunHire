package com.tunhire.tunhire.notifications;

import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.notifications.entity.CandidateApplicationView;
import com.tunhire.tunhire.notifications.entity.CandidateApplicationViewId;
import com.tunhire.tunhire.notifications.repository.CandidateApplicationViewRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CandidateApplicationViewService {

    private final ApplicationRepository applicationRepository;
    private final CandidateApplicationViewRepository viewRepository;

    public CandidateApplicationViewService(
        ApplicationRepository applicationRepository,
        CandidateApplicationViewRepository viewRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.viewRepository = viewRepository;
    }

    public void seedViewForNewApplication(
        Long userId,
        Long applicationId,
        ApplicationStatus status
    ) {
        upsertView(userId, applicationId, status);
    }

    public void syncAllViewsForCandidate(Long userId) {
        List<Application> applications = applicationRepository.findByUserId(userId);
        Instant now = Instant.now();
        for (Application application : applications) {
            upsertView(userId, application.getId(), application.getStatus(), now);
        }
    }

    @Transactional(readOnly = true)
    public long countStatusUpdates(Long userId) {
        List<Application> applications = applicationRepository.findByUserId(userId);
        if (applications.isEmpty()) {
            return 0;
        }

        Map<Long, ApplicationStatus> seenByApplicationId = viewRepository
            .findByIdUserId(userId)
            .stream()
            .collect(
                Collectors.toMap(
                    view -> view.getId().getApplicationId(),
                    CandidateApplicationView::getLastSeenStatus
                )
            );

        return applications
            .stream()
            .filter(application -> {
                ApplicationStatus seen = seenByApplicationId.get(application.getId());
                if (seen == null) {
                    return false;
                }
                return !seen.equals(application.getStatus());
            })
            .count();
    }

    private void upsertView(
        Long userId,
        Long applicationId,
        ApplicationStatus status
    ) {
        upsertView(userId, applicationId, status, Instant.now());
    }

    private void upsertView(
        Long userId,
        Long applicationId,
        ApplicationStatus status,
        Instant seenAt
    ) {
        CandidateApplicationViewId id = new CandidateApplicationViewId(
            userId,
            applicationId
        );
        CandidateApplicationView view = viewRepository
            .findById(id)
            .orElse(
                CandidateApplicationView.builder()
                    .id(id)
                    .build()
            );
        view.setLastSeenStatus(status);
        view.setLastSeenAt(seenAt);
        viewRepository.save(view);
    }
}
