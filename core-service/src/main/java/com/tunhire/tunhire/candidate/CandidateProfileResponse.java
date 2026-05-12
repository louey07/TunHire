package com.tunhire.tunhire.candidate;

import java.time.LocalDate;
import java.util.List;

public record CandidateProfileResponse(
    Long id,
    Long userId,
    String bio,
    String resumeUrl,
    String location,
    LocalDate availableFrom,
    Integer yearsOfExperience,
    List<CandidateSkillResponse> skills
) {}

