package com.tunhire.tunhire.applications;

import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationMatchScore;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.candidate.CandidateProfileProvider;
import com.tunhire.tunhire.common.CandidateSummaryDto;
import com.tunhire.tunhire.common.MatchScoreHashUtil;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import com.tunhire.tunhire.companies.DashboardApplicationItem;
import com.tunhire.tunhire.job_offers.entity.Job;
import com.tunhire.tunhire.job_offers.repository.JobRepository;
import com.tunhire.tunhire.notifications.CandidateApplicationViewService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobLookupService jobLookupService;
    private final CandidateProfileProvider candidateProfileProvider;
    private final JobRepository jobRepository;
    private final ApplicationMatchScoreService matchScoreService;
    private final CandidateApplicationViewService candidateApplicationViewService;

    public ApplicationService(
        ApplicationRepository applicationRepository,
        JobLookupService jobLookupService,
        CandidateProfileProvider candidateProfileProvider,
        JobRepository jobRepository,
        ApplicationMatchScoreService matchScoreService,
        CandidateApplicationViewService candidateApplicationViewService
    ) {
        this.applicationRepository = applicationRepository;
        this.jobLookupService = jobLookupService;
        this.candidateProfileProvider = candidateProfileProvider;
        this.jobRepository = jobRepository;
        this.matchScoreService = matchScoreService;
        this.candidateApplicationViewService = candidateApplicationViewService;
    }

    public ApplicationResponse create(
        ApplicationCreateRequest request,
        Long userId
    ) {
        Application application = new Application();
        application.setJobId(request.jobId());
        application.setUserId(userId);
        application.setStatus(ApplicationStatus.SUBMITTED);
        Application saved = applicationRepository.save(application);
        candidateApplicationViewService.seedViewForNewApplication(
            userId,
            saved.getId(),
            saved.getStatus()
        );
        return toResponse(saved);
    }

    public ApplicationResponse getById(Long id) {
        Application application = applicationRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Application not found")
            );
        return toResponse(application);
    }

    public List<ApplicationSummary> getByJobId(Long jobId) {
        return toSummaryList(applicationRepository.findByJobId(jobId));
    }

    public List<ApplicationSummary> getByUserId(Long userId) {
        return toSummaryList(applicationRepository.findByUserId(userId));
    }

    public List<ApplicationSummary> getApplicationsForCompany(Long companyId) {
        List<Long> jobIds = jobLookupService.getJobIdsByCompanyId(companyId);
        if (jobIds == null || jobIds.isEmpty()) {
            return Collections.emptyList();
        }
        return toSummaryList(applicationRepository.findByJobIdIn(jobIds));
    }

    public List<DashboardApplicationItem> getDashboardApplicationsForCompany(
        Long companyId,
        Map<Long, String> jobTitlesById
    ) {
        List<Long> jobIds = jobLookupService.getJobIdsByCompanyId(companyId);
        if (jobIds == null || jobIds.isEmpty()) {
            return Collections.emptyList();
        }
        return applicationRepository.findByJobIdIn(jobIds).stream()
            .map(app -> toDashboardItem(app, jobTitlesById))
            .collect(Collectors.toList());
    }

    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatus status, Long recruiterId) {
        Application application = applicationRepository
            .findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!jobLookupService.isRecruiterAuthorizedForJob(application.getJobId(), recruiterId)) {
            throw new IllegalArgumentException("You do not have permission to update this application");
        }

        application.setStatus(status);
        application.setStatusUpdatedAt(Instant.now());
        return toResponse(applicationRepository.save(application));
    }

    public void deleteForCandidate(Long applicationId, Long userId) {
        Application application = applicationRepository
            .findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getUserId().equals(userId)) {
            throw new IllegalArgumentException(
                "You can only delete your own applications"
            );
        }

        applicationRepository.delete(application);
    }

    public List<RankedApplicationResponse> getRankedByJobId(Long jobId) {
        List<Application> applications = applicationRepository.findByJobId(jobId);

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        Map<Long, ApplicationMatchScore> scoresByApplicationId =
            matchScoreService.resolveScoresForJob(job, applications);

        List<RankedApplicationResponse> result = new ArrayList<>();
        for (Application application : applications) {
            ApplicationMatchScore score = scoresByApplicationId.get(application.getId());
            if (score != null) {
                result.add(new RankedApplicationResponse(
                    application.getId(),
                    application.getJobId(),
                    application.getUserId(),
                    application.getStatus(),
                    application.getCreatedAt(),
                    score.getScore(),
                    score.getLevel(),
                    MatchScoreHashUtil.fromJson(score.getMatchedSkillsJson()),
                    MatchScoreHashUtil.fromJson(score.getGapsJson()),
                    score.getSummary()
                ));
            } else {
                result.add(new RankedApplicationResponse(
                    application.getId(),
                    application.getJobId(),
                    application.getUserId(),
                    application.getStatus(),
                    application.getCreatedAt(),
                    null,
                    null,
                    null,
                    null,
                    null
                ));
            }
        }

        result.sort(
            Comparator.comparing(
                RankedApplicationResponse::score,
                Comparator.nullsLast(Comparator.reverseOrder())
            )
        );

        return result;
    }

    private ApplicationResponse toResponse(Application application) {
        CandidateSummaryDto summary =
            candidateProfileProvider.getCandidateSummary(
                application.getUserId()
            );
        return new ApplicationResponse(
            application.getId(),
            application.getJobId(),
            application.getUserId(),
            summary != null ? summary.firstName() : "Unknown",
            summary != null ? summary.lastName() : "Unknown",
            summary != null ? summary.resumeUrl() : null,
            application.getStatus(),
            application.getCreatedAt()
        );
    }

    private DashboardApplicationItem toDashboardItem(
        Application application,
        Map<Long, String> jobTitlesById
    ) {
        CandidateSummaryDto summary =
            candidateProfileProvider.getCandidateSummary(
                application.getUserId()
            );
        String jobTitle = jobTitlesById.getOrDefault(
            application.getJobId(),
            "Offre"
        );
        return new DashboardApplicationItem(
            application.getId(),
            application.getJobId(),
            jobTitle,
            application.getUserId(),
            summary != null ? summary.firstName() : "Unknown",
            summary != null ? summary.lastName() : "Unknown",
            application.getStatus(),
            application.getCreatedAt()
        );
    }

    private List<ApplicationSummary> toSummaryList(
        List<Application> applications
    ) {
        return applications
            .stream()
            .map(app ->
                new ApplicationSummary(
                    app.getId(),
                    app.getJobId(),
                    app.getUserId(),
                    app.getStatus(),
                    app.getCreatedAt()
                )
            )
            .collect(Collectors.toList());
    }
}
