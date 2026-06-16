package com.tunhire.tunhire.notifications;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.notifications.entity.CandidateApplicationView;
import com.tunhire.tunhire.notifications.entity.CandidateApplicationViewId;
import com.tunhire.tunhire.notifications.repository.CandidateApplicationViewRepository;
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
class CandidateApplicationViewServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private CandidateApplicationViewRepository viewRepository;

    @InjectMocks
    private CandidateApplicationViewService viewService;

    @Test
    void countStatusUpdatesReturnsMismatchOnlyWhenViewExists() {
        Application application = new Application();
        application.setId(1L);
        application.setUserId(20L);
        application.setStatus(ApplicationStatus.IN_REVIEW);

        CandidateApplicationView view = CandidateApplicationView.builder()
            .id(new CandidateApplicationViewId(20L, 1L))
            .lastSeenStatus(ApplicationStatus.SUBMITTED)
            .lastSeenAt(Instant.now())
            .build();

        when(applicationRepository.findByUserId(20L)).thenReturn(List.of(application));
        when(viewRepository.findByIdUserId(20L)).thenReturn(List.of(view));

        assertThat(viewService.countStatusUpdates(20L)).isEqualTo(1);
    }

    @Test
    void countStatusUpdatesIgnoresApplicationsWithoutViewRow() {
        Application application = new Application();
        application.setId(1L);
        application.setUserId(20L);
        application.setStatus(ApplicationStatus.IN_REVIEW);

        when(applicationRepository.findByUserId(20L)).thenReturn(List.of(application));
        when(viewRepository.findByIdUserId(20L)).thenReturn(List.of());

        assertThat(viewService.countStatusUpdates(20L)).isZero();
    }

    @Test
    void seedViewForNewApplicationUpsertsSubmittedStatus() {
        when(viewRepository.findById(any(CandidateApplicationViewId.class)))
            .thenReturn(Optional.empty());
        when(viewRepository.save(any(CandidateApplicationView.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        viewService.seedViewForNewApplication(
            20L,
            1L,
            ApplicationStatus.SUBMITTED
        );

        ArgumentCaptor<CandidateApplicationView> captor =
            ArgumentCaptor.forClass(CandidateApplicationView.class);
        verify(viewRepository).save(captor.capture());
        assertThat(captor.getValue().getLastSeenStatus())
            .isEqualTo(ApplicationStatus.SUBMITTED);
    }
}
