package com.tunhire.tunhire.applications.service;
import com.tunhire.tunhire.applications.JobLookupService;


import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tunhire.tunhire.applications.ApplicationCreateRequest;
import com.tunhire.tunhire.applications.ApplicationSummary;
import com.tunhire.tunhire.applications.ApplicationService;
import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.candidate.CandidateProfileProvider;
import com.tunhire.tunhire.common.CandidateSummaryDto;
import com.tunhire.tunhire.companies.DashboardApplicationItem;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobLookupService jobLookupService;

    @Mock
    private CandidateProfileProvider candidateProfileProvider;

    @InjectMocks
    private ApplicationService applicationService;

    @Test
    void createSetsDefaults() {
        when(applicationRepository.save(any(Application.class))).thenAnswer(
            invocation -> {
                Application application = invocation.getArgument(0);
                application.setId(1L);
                application.setCreatedAt(Instant.now());
                return application;
            }
        );

        lenient()
            .when(candidateProfileProvider.getCandidateSummary(any()))
            .thenReturn(null);

        var response = applicationService.create(
            new ApplicationCreateRequest(10L),
            20L
        );
        assertThat(response.status()).isEqualTo(ApplicationStatus.SUBMITTED);
        assertThat(response.createdAt()).isNotNull();
        assertThat(response.userId()).isEqualTo(20L);
    }

    @Test
    void getApplicationsForCompanyFiltersByJobs() {
        when(jobLookupService.getJobIdsByCompanyId(99L)).thenReturn(
            List.of(10L)
        );
        when(applicationRepository.findByJobIdIn(eq(List.of(10L)))).thenReturn(
            List.of(
                buildApplication(1L, 10L, 1L),
                buildApplication(2L, 10L, 2L)
            )
        );

        lenient()
            .when(candidateProfileProvider.getCandidateSummary(any()))
            .thenReturn(null);

        List<ApplicationSummary> results =
            applicationService.getApplicationsForCompany(99L);
        assertThat(results).hasSize(2);
        assertThat(results.get(0).jobId()).isEqualTo(10L);
    }

    @Test
    void getDashboardApplicationsForCompanyEnrichesNamesAndJobTitles() {
        when(jobLookupService.getJobIdsByCompanyId(99L)).thenReturn(
            List.of(10L)
        );
        when(applicationRepository.findByJobIdIn(eq(List.of(10L)))).thenReturn(
            List.of(buildApplication(1L, 10L, 20L))
        );
        when(candidateProfileProvider.getCandidateSummary(20L)).thenReturn(
            new CandidateSummaryDto(20L, "Ahmed", "Ben", null)
        );

        List<DashboardApplicationItem> results =
            applicationService.getDashboardApplicationsForCompany(
                99L,
                Map.of(10L, "Développeur Java")
            );

        assertThat(results).hasSize(1);
        assertThat(results.get(0).candidateFirstName()).isEqualTo("Ahmed");
        assertThat(results.get(0).candidateLastName()).isEqualTo("Ben");
        assertThat(results.get(0).jobTitle()).isEqualTo("Développeur Java");
    }

    @Test
    void getDashboardApplicationsForCompanyReturnsEmptyWhenNoJobs() {
        when(jobLookupService.getJobIdsByCompanyId(99L)).thenReturn(List.of());

        List<DashboardApplicationItem> results =
            applicationService.getDashboardApplicationsForCompany(
                99L,
                Map.of()
            );

        assertThat(results).isEmpty();
    }

    @Test
    void deleteForCandidateRemovesOwnApplication() {
        Application application = buildApplication(1L, 10L, 20L);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));

        applicationService.deleteForCandidate(1L, 20L);

        verify(applicationRepository).delete(application);
    }

    @Test
    void deleteForCandidateRejectsOtherUsersApplication() {
        when(applicationRepository.findById(1L)).thenReturn(
            Optional.of(buildApplication(1L, 10L, 20L))
        );

        assertThatThrownBy(() -> applicationService.deleteForCandidate(1L, 99L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("your own applications");
    }

    private Application buildApplication(Long id, Long jobId, Long userId) {
        Application application = new Application();
        application.setId(id);
        application.setJobId(jobId);
        application.setUserId(userId);
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setCreatedAt(Instant.now());
        return application;
    }
}


