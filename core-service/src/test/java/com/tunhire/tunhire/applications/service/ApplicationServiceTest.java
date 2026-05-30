package com.tunhire.tunhire.applications.service;
import com.tunhire.tunhire.applications.JobLookupService;


import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tunhire.tunhire.applications.ApplicationMatchScoreService;
import com.tunhire.tunhire.applications.ApplicationCreateRequest;
import com.tunhire.tunhire.applications.ApplicationSummary;
import com.tunhire.tunhire.applications.ApplicationService;
import com.tunhire.tunhire.applications.RankedApplicationResponse;
import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationMatchScore;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.candidate.CandidateProfileProvider;
import com.tunhire.tunhire.common.CandidateSummaryDto;
import com.tunhire.tunhire.companies.DashboardApplicationItem;
import com.tunhire.tunhire.job_offers.entity.Job;
import com.tunhire.tunhire.notifications.CandidateApplicationViewService;
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

    @Mock
    private com.tunhire.tunhire.job_offers.repository.JobRepository jobRepository;

    @Mock
    private ApplicationMatchScoreService matchScoreService;

    @Mock
    private CandidateApplicationViewService candidateApplicationViewService;

    @InjectMocks
    private ApplicationService applicationService;

    @Test
    void createSetsDefaults() {
        when(applicationRepository.save(any(Application.class))).thenAnswer(
            invocation -> {
                Application application = invocation.getArgument(0);
                application.setId(1L);
                application.setCreatedAt(Instant.now());
                application.setStatusUpdatedAt(Instant.now());
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
        verify(candidateApplicationViewService).seedViewForNewApplication(
            20L,
            1L,
            ApplicationStatus.SUBMITTED
        );
    }

    @Test
    void updateStatusSetsStatusUpdatedAt() {
        Application application = buildApplication(1L, 10L, 20L);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(application));
        when(jobLookupService.isRecruiterAuthorizedForJob(10L, 99L)).thenReturn(true);
        when(applicationRepository.save(any(Application.class))).thenAnswer(
            invocation -> invocation.getArgument(0)
        );

        applicationService.updateStatus(1L, ApplicationStatus.IN_REVIEW, 99L);

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.IN_REVIEW);
        assertThat(application.getStatusUpdatedAt()).isNotNull();
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

    @Test
    void getRankedByJobIdUsesCachedScoresAndSortsDescending() {
        Application lowerScoreApp = buildApplication(1L, 10L, 20L);
        Application higherScoreApp = buildApplication(2L, 10L, 21L);
        when(applicationRepository.findByJobId(10L)).thenReturn(
            List.of(lowerScoreApp, higherScoreApp)
        );

        Job job = Job.builder().id(10L).title("Java Dev").build();
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        ApplicationMatchScore low = ApplicationMatchScore.builder()
            .applicationId(1L)
            .jobId(10L)
            .score(60)
            .level("Average Match")
            .matchedSkillsJson("[\"Java\"]")
            .gapsJson("[\"Expérience inférieure au niveau demandé\"]")
            .summary(null)
            .build();
        ApplicationMatchScore high = ApplicationMatchScore.builder()
            .applicationId(2L)
            .jobId(10L)
            .score(88)
            .level("Excellent Match")
            .matchedSkillsJson("[\"Java\",\"Spring\"]")
            .gapsJson("[]")
            .summary("Profil très aligné sur l'offre")
            .build();
        when(matchScoreService.resolveScoresForJob(eq(job), any())).thenReturn(
            Map.of(1L, low, 2L, high)
        );

        List<RankedApplicationResponse> ranked =
            applicationService.getRankedByJobId(10L);

        assertThat(ranked).hasSize(2);
        assertThat(ranked.get(0).applicationId()).isEqualTo(2L);
        assertThat(ranked.get(0).score()).isEqualTo(88);
        assertThat(ranked.get(0).summary()).isEqualTo("Profil très aligné sur l'offre");
        assertThat(ranked.get(1).gaps()).contains("Expérience inférieure au niveau demandé");
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


