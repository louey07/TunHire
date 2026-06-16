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
            List<String> languages,
            @JsonProperty("cv_summary") String cvSummary
    ) {}

    public record CandidateRankV2(
            @JsonProperty("candidate_id") Long candidateId,
            int score,
            String level,
            @JsonProperty("matched_skills") List<String> matchedSkills,
            List<String> gaps,
            String summary
    ) {}

    private record RankRequestV2(
            JobMatchDto job,
            List<CandidateMatchDto> candidates
    ) {}

    private record RankResponseV2(
            @JsonProperty("scorer_version") String scorerVersion,
            List<CandidateRankV2> rankings
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

    public List<CandidateRankV2> rankCandidatesV2(
            JobMatchDto job,
            List<CandidateMatchDto> candidates
    ) {
        try {
            RankResponseV2 response = restTemplate.postForObject(
                    baseUrl + "/v2/rank",
                    new RankRequestV2(job, candidates),
                    RankResponseV2.class
            );
            return response != null ? response.rankings() : null;
        } catch (RestClientException e) {
            log.warn("AI service unavailable for v2 candidate ranking: {}", e.getMessage());
            return null;
        }
    }
}
