package com.tunhire.tunhire.applications;

import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationMatchScore;
import com.tunhire.tunhire.applications.repository.ApplicationMatchScoreRepository;
import com.tunhire.tunhire.candidate.entity.CandidateProfile;
import com.tunhire.tunhire.candidate.repository.CandidateProfileRepository;
import com.tunhire.tunhire.candidate.repository.CandidateSkillRepository;
import com.tunhire.tunhire.common.AiServiceClient;
import com.tunhire.tunhire.common.CandidateMatchDto;
import com.tunhire.tunhire.common.JobMatchDto;
import com.tunhire.tunhire.common.MatchScoreHashUtil;
import com.tunhire.tunhire.job_offers.entity.Job;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ApplicationMatchScoreService {

    private final ApplicationMatchScoreRepository scoreRepository;
    private final CandidateProfileRepository profileRepository;
    private final CandidateSkillRepository skillRepository;
    private final AiServiceClient aiServiceClient;

    @Value("${ai.scorer.version:2.0}")
    private String expectedScorerVersion;

    public ApplicationMatchScoreService(
        ApplicationMatchScoreRepository scoreRepository,
        CandidateProfileRepository profileRepository,
        CandidateSkillRepository skillRepository,
        AiServiceClient aiServiceClient
    ) {
        this.scoreRepository = scoreRepository;
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public Map<Long, ApplicationMatchScore> resolveScoresForJob(
        Job job,
        List<Application> applications
    ) {
        if (applications.isEmpty()) {
            return Map.of();
        }

        String jobHash = MatchScoreHashUtil.computeJobVersionHash(job);
        Map<Long, ApplicationMatchScore> result = new HashMap<>();

        List<Application> staleApplications = new ArrayList<>();
        Map<Long, CandidateMatchDto> staleCandidates = new HashMap<>();
        Map<Long, String> staleProfileHashes = new HashMap<>();

        for (Application application : applications) {
            Optional<ApplicationMatchScore> cached =
                scoreRepository.findById(application.getId());

            CandidateProfile profile = profileRepository
                .findByUserId(application.getUserId())
                .orElse(null);

            List<String> skills = loadSkills(profile);
            String profileHash = profile != null
                ? MatchScoreHashUtil.computeProfileVersionHash(profile, skills)
                : MatchScoreHashUtil.computeProfileVersionHash(
                    new CandidateProfile(),
                    skills
                );

            if (
                cached.isPresent() &&
                isFresh(cached.get(), jobHash, profileHash)
            ) {
                result.put(application.getId(), cached.get());
                continue;
            }

            staleApplications.add(application);
            staleCandidates.put(
                application.getUserId(),
                toCandidateDto(application.getUserId(), profile, skills)
            );
            staleProfileHashes.put(application.getId(), profileHash);
        }

        if (!staleApplications.isEmpty()) {
            JobMatchDto jobDto = toJobDto(job);
            List<CandidateMatchDto> candidateDtos = staleApplications.stream()
                .map(app -> staleCandidates.get(app.getUserId()))
                .collect(Collectors.toList());

            List<AiServiceClient.CandidateRankV2> rankings =
                aiServiceClient.rankCandidatesV2(jobDto, candidateDtos);

            if (rankings != null) {
                Map<Long, AiServiceClient.CandidateRankV2> byUserId = rankings.stream()
                    .collect(Collectors.toMap(
                        AiServiceClient.CandidateRankV2::candidateId,
                        r -> r,
                        (a, b) -> a
                    ));

                for (Application application : staleApplications) {
                    AiServiceClient.CandidateRankV2 rank =
                        byUserId.get(application.getUserId());
                    if (rank == null) {
                        continue;
                    }
                    ApplicationMatchScore saved = upsertScore(
                        application,
                        job.getId(),
                        jobHash,
                        staleProfileHashes.get(application.getId()),
                        rank
                    );
                    result.put(application.getId(), saved);
                }
            }
        }

        return result;
    }

    private boolean isFresh(
        ApplicationMatchScore cached,
        String jobHash,
        String profileHash
    ) {
        return expectedScorerVersion.equals(cached.getScorerVersion()) &&
            jobHash.equals(cached.getJobVersionHash()) &&
            profileHash.equals(cached.getProfileVersionHash());
    }

    private ApplicationMatchScore upsertScore(
        Application application,
        Long jobId,
        String jobHash,
        String profileHash,
        AiServiceClient.CandidateRankV2 rank
    ) {
        ApplicationMatchScore score = scoreRepository
            .findById(application.getId())
            .orElse(ApplicationMatchScore.builder()
                .applicationId(application.getId())
                .build());

        score.setJobId(jobId);
        score.setScore(rank.score());
        score.setLevel(rank.level());
        score.setMatchedSkillsJson(MatchScoreHashUtil.toJson(rank.matchedSkills()));
        score.setGapsJson(MatchScoreHashUtil.toJson(rank.gaps()));
        score.setSummary(rank.summary());
        score.setJobVersionHash(jobHash);
        score.setProfileVersionHash(profileHash);
        score.setScorerVersion(expectedScorerVersion);
        score.setComputedAt(Instant.now());

        return scoreRepository.save(score);
    }

    private List<String> loadSkills(CandidateProfile profile) {
        if (profile == null || profile.getId() == null) {
            return List.of();
        }
        return skillRepository.findByProfileId(profile.getId()).stream()
            .map(skill -> skill.getSkillName())
            .collect(Collectors.toList());
    }

    private CandidateMatchDto toCandidateDto(
        Long userId,
        CandidateProfile profile,
        List<String> skills
    ) {
        if (profile == null) {
            return new CandidateMatchDto(
                userId,
                skills,
                null,
                null,
                null,
                null,
                List.of(),
                List.of(),
                null
            );
        }

        return new CandidateMatchDto(
            userId,
            skills,
            profile.getBio(),
            profile.getLocation(),
            profile.getYearsOfExperience(),
            profile.getAvailableFrom() != null
                ? profile.getAvailableFrom().toString()
                : null,
            MatchScoreHashUtil.fromJson(profile.getLanguagesJson()),
            MatchScoreHashUtil.fromJson(profile.getEducationJson()),
            profile.getCvSummary()
        );
    }

    private JobMatchDto toJobDto(Job job) {
        return new JobMatchDto(
            job.getTitle(),
            job.getDescription(),
            job.getLocation(),
            job.getWorkMode() != null ? job.getWorkMode().name() : null,
            job.getContractType(),
            job.getExperienceLevel(),
            job.getSalaryMin() != null ? job.getSalaryMin().doubleValue() : null,
            job.getSalaryMax() != null ? job.getSalaryMax().doubleValue() : null
        );
    }
}
