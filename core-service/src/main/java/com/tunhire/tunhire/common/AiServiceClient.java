package com.tunhire.tunhire.common;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String baseUrl;

    public record CvParseResult(
            @JsonProperty("full_name") String fullName,
            String email,
            String phone,
            String location,
            @JsonProperty("years_experience") int yearsExperience,
            List<String> skills,
            List<String> education,
            List<String> languages
    ) {}

    public record MatchResult(
            int score,
            String level,
            @JsonProperty("matched_skills") List<String> matchedSkills
    ) {}

    public record CandidateRank(
            @JsonProperty("candidate_id") Long candidateId,
            int score,
            String level,
            @JsonProperty("matched_skills") List<String> matchedSkills
    ) {}

    private record MatchRequest(
            @JsonProperty("candidate_skills") List<String> candidateSkills,
            @JsonProperty("job_description") String jobDescription
    ) {}

    private record CandidateInput(
            @JsonProperty("candidate_id") Long candidateId,
            List<String> skills
    ) {}

    private record RankRequest(
            @JsonProperty("job_description") String jobDescription,
            List<CandidateInput> candidates
    ) {}

    private record RankResponse(
            List<CandidateRank> rankings
    ) {}

    public CvParseResult parseCv(MultipartFile file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            return restTemplate.postForObject(baseUrl + "/v1/cv/parse", request, CvParseResult.class);
        } catch (RestClientException e) {
            log.warn("AI service unavailable for CV parsing: {}", e.getMessage());
            return null;
        } catch (IOException e) {
            log.warn("Failed to read uploaded file for CV parsing: {}", e.getMessage());
            return null;
        }
    }

    public MatchResult matchCandidate(List<String> skills, String jobDescription) {
        try {
            return restTemplate.postForObject(
                    baseUrl + "/v1/match",
                    new MatchRequest(skills, jobDescription),
                    MatchResult.class
            );
        } catch (RestClientException e) {
            log.warn("AI service unavailable for candidate matching: {}", e.getMessage());
            return null;
        }
    }

    public List<CandidateRank> rankCandidates(String jobDescription, List<CandidateSkillsDto> candidates) {
        try {
            List<CandidateInput> inputs = candidates.stream()
                    .map(c -> new CandidateInput(c.candidateId(), c.skills()))
                    .toList();

            RankResponse response = restTemplate.postForObject(
                    baseUrl + "/v1/rank",
                    new RankRequest(jobDescription, inputs),
                    RankResponse.class
            );

            return response != null ? response.rankings() : null;
        } catch (RestClientException e) {
            log.warn("AI service unavailable for candidate ranking: {}", e.getMessage());
            return null;
        }
    }
}
