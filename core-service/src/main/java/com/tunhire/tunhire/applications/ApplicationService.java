package com.tunhire.tunhire.applications;
import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import com.tunhire.tunhire.applications.repository.ApplicationRepository;
import com.tunhire.tunhire.candidate.CandidateProfileProvider;
import com.tunhire.tunhire.candidate.repository.CandidateProfileRepository;
import com.tunhire.tunhire.candidate.repository.CandidateSkillRepository;
import com.tunhire.tunhire.common.AiServiceClient;
import com.tunhire.tunhire.common.CandidateSkillsDto;
import com.tunhire.tunhire.common.CandidateSummaryDto;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import com.tunhire.tunhire.job_offers.repository.JobRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final AiServiceClient aiServiceClient;

    public ApplicationService(
        ApplicationRepository applicationRepository,
        JobLookupService jobLookupService,
        CandidateProfileProvider candidateProfileProvider,
        JobRepository jobRepository,
        CandidateProfileRepository candidateProfileRepository,
        CandidateSkillRepository candidateSkillRepository,
        AiServiceClient aiServiceClient
    ) {
        this.applicationRepository = applicationRepository;
        this.jobLookupService = jobLookupService;
        this.candidateProfileProvider = candidateProfileProvider;
        this.jobRepository = jobRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateSkillRepository = candidateSkillRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public ApplicationResponse create(
        ApplicationCreateRequest request,
        Long userId
    ) {
        Application application = new Application();
        application.setJobId(request.jobId());
        application.setUserId(userId);
        application.setStatus(ApplicationStatus.SUBMITTED);
        return toResponse(applicationRepository.save(application));
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

    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatus status, Long recruiterId) {
        Application application = applicationRepository
            .findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!jobLookupService.isRecruiterAuthorizedForJob(application.getJobId(), recruiterId)) {
            throw new IllegalArgumentException("You do not have permission to update this application");
        }

        application.setStatus(status);
        return toResponse(applicationRepository.save(application));
    }

    public List<RankedApplicationResponse> getRankedByJobId(Long jobId) {
        List<Application> applications = applicationRepository.findByJobId(jobId);

        String jobDescription = jobRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found"))
            .getDescription();

        List<CandidateSkillsDto> candidateDtos = applications.stream()
            .map(app -> {
                List<String> skills = candidateProfileRepository.findByUserId(app.getUserId())
                    .map(profile -> candidateSkillRepository.findByProfileId(profile.getId())
                        .stream()
                        .map(skill -> skill.getSkillName())
                        .toList())
                    .orElse(List.of());
                return new CandidateSkillsDto(app.getUserId(), skills);
            })
            .toList();

        List<AiServiceClient.CandidateRank> rankings =
            aiServiceClient.rankCandidates(jobDescription, candidateDtos);

        if (rankings == null) {
            return applications.stream()
                .map(app -> new RankedApplicationResponse(
                    app.getId(), app.getJobId(), app.getUserId(),
                    app.getStatus(), app.getCreatedAt(),
                    null, null, null
                ))
                .toList();
        }

        Map<Long, Application> appByUserId = applications.stream()
            .collect(Collectors.toMap(Application::getUserId, a -> a));

        Set<Long> rankedUserIds = rankings.stream()
            .map(AiServiceClient.CandidateRank::candidateId)
            .collect(Collectors.toSet());

        List<RankedApplicationResponse> result = new ArrayList<>(
            rankings.stream()
                .filter(rank -> appByUserId.containsKey(rank.candidateId()))
                .map(rank -> {
                    Application app = appByUserId.get(rank.candidateId());
                    return new RankedApplicationResponse(
                        app.getId(), app.getJobId(), app.getUserId(),
                        app.getStatus(), app.getCreatedAt(),
                        rank.score(), rank.level(), rank.matchedSkills()
                    );
                })
                .toList()
        );

        applications.stream()
            .filter(app -> !rankedUserIds.contains(app.getUserId()))
            .map(app -> new RankedApplicationResponse(
                app.getId(), app.getJobId(), app.getUserId(),
                app.getStatus(), app.getCreatedAt(),
                null, null, null
            ))
            .forEach(result::add);

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
