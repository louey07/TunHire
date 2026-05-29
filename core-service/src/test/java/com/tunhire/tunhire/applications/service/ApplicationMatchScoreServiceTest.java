package com.tunhire.tunhire.applications.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tunhire.tunhire.applications.ApplicationMatchScoreService;
import com.tunhire.tunhire.applications.entity.Application;
import com.tunhire.tunhire.applications.entity.ApplicationMatchScore;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import com.tunhire.tunhire.applications.repository.ApplicationMatchScoreRepository;
import com.tunhire.tunhire.candidate.entity.CandidateProfile;
import com.tunhire.tunhire.candidate.entity.CandidateSkill;
import com.tunhire.tunhire.candidate.repository.CandidateProfileRepository;
import com.tunhire.tunhire.candidate.repository.CandidateSkillRepository;
import com.tunhire.tunhire.common.AiServiceClient;
import com.tunhire.tunhire.common.CandidateMatchDto;
import com.tunhire.tunhire.common.JobMatchDto;
import com.tunhire.tunhire.common.MatchScoreHashUtil;
import com.tunhire.tunhire.job_offers.entity.Job;
import com.tunhire.tunhire.job_offers.entity.WorkMode;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ApplicationMatchScoreServiceTest {

    @Mock
    private ApplicationMatchScoreRepository scoreRepository;

    @Mock
    private CandidateProfileRepository profileRepository;

    @Mock
    private CandidateSkillRepository skillRepository;

    @Mock
    private AiServiceClient aiServiceClient;

    @InjectMocks
    private ApplicationMatchScoreService matchScoreService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(matchScoreService, "expectedScorerVersion", "2.0");
    }

    @Test
    void resolveScoresForJobUsesCacheWhenFresh() {
        Job job = buildJob();
        Application application = buildApplication(1L, 10L, 20L);
        CandidateProfile profile = buildProfile(20L);
        List<String> skills = List.of("Java", "Spring");

        when(profileRepository.findByUserId(20L)).thenReturn(Optional.of(profile));
        when(skillRepository.findByProfileId(1L)).thenReturn(
            List.of(skill("Java"), skill("Spring"))
        );

        String jobHash = MatchScoreHashUtil.computeJobVersionHash(job);
        String profileHash = MatchScoreHashUtil.computeProfileVersionHash(profile, skills);

        ApplicationMatchScore cached = ApplicationMatchScore.builder()
            .applicationId(1L)
            .jobId(10L)
            .score(82)
            .level("Good Match")
            .matchedSkillsJson("[\"Java\"]")
            .gapsJson("[]")
            .summary("Profil solide")
            .jobVersionHash(jobHash)
            .profileVersionHash(profileHash)
            .scorerVersion("2.0")
            .computedAt(Instant.now())
            .build();

        when(scoreRepository.findById(1L)).thenReturn(Optional.of(cached));

        var result = matchScoreService.resolveScoresForJob(job, List.of(application));

        assertThat(result).containsKey(1L);
        assertThat(result.get(1L).getScore()).isEqualTo(82);
        verify(aiServiceClient, never()).rankCandidatesV2(any(), any());
    }

    @Test
    void resolveScoresForJobCallsAiWhenCacheMissing() {
        Job job = buildJob();
        Application application = buildApplication(1L, 10L, 20L);
        CandidateProfile profile = buildProfile(20L);

        when(profileRepository.findByUserId(20L)).thenReturn(Optional.of(profile));
        when(skillRepository.findByProfileId(1L)).thenReturn(List.of(skill("Java")));
        when(scoreRepository.findById(1L)).thenReturn(Optional.empty());
        when(scoreRepository.save(any(ApplicationMatchScore.class))).thenAnswer(
            invocation -> invocation.getArgument(0)
        );
        when(aiServiceClient.rankCandidatesV2(any(JobMatchDto.class), any())).thenReturn(
            List.of(
                new AiServiceClient.CandidateRankV2(
                    20L,
                    75,
                    "Good Match",
                    List.of("Java"),
                    List.of(),
                    "Bon profil backend"
                )
            )
        );

        var result = matchScoreService.resolveScoresForJob(job, List.of(application));

        assertThat(result.get(1L).getScore()).isEqualTo(75);
        verify(aiServiceClient).rankCandidatesV2(any(JobMatchDto.class), any());

        ArgumentCaptor<ApplicationMatchScore> captor =
            ArgumentCaptor.forClass(ApplicationMatchScore.class);
        verify(scoreRepository).save(captor.capture());
        assertThat(captor.getValue().getScorerVersion()).isEqualTo("2.0");
    }

    private Job buildJob() {
        Job job = new Job();
        job.setId(10L);
        job.setTitle("Développeur Java");
        job.setDescription("Backend Spring Boot");
        job.setLocation("Tunis");
        job.setWorkMode(WorkMode.HYBRID);
        job.setContractType("CDI");
        job.setExperienceLevel("INTERMEDIAIRE");
        job.setSalaryMin(new BigDecimal("1200"));
        job.setSalaryMax(new BigDecimal("1800"));
        return job;
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

    private CandidateProfile buildProfile(Long userId) {
        CandidateProfile profile = new CandidateProfile();
        profile.setId(1L);
        profile.setUserId(userId);
        profile.setLocation("Tunis");
        profile.setYearsOfExperience(3);
        return profile;
    }

    private CandidateSkill skill(String name) {
        CandidateSkill skill = new CandidateSkill();
        skill.setSkillName(name);
        return skill;
    }
}
