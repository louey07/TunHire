package com.tunhire.tunhire.common;

public record CandidateSummaryDto(
        Long userId,
        String firstName,
        String lastName,
        String resumeUrl
) {
}

