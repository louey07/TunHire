package com.tunhire.tunhire.candidate;

import java.time.LocalDate;

public record UpdateProfileRequest(
    String bio,
    String resumeUrl,
    String location,
    LocalDate availableFrom,
    Integer yearsOfExperience
) {}

