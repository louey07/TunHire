package com.tunhire.tunhire.common;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CandidateMatchDto(
    @JsonProperty("candidate_id") Long candidateId,
    List<String> skills,
    String bio,
    String location,
    @JsonProperty("years_experience") Integer yearsExperience,
    @JsonProperty("available_from") String availableFrom,
    List<String> languages,
    List<String> education,
    @JsonProperty("cv_summary") String cvSummary
) {}
