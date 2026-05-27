package com.tunhire.tunhire.applications;

import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import java.time.Instant;
import java.util.List;

public record RankedApplicationResponse(
        Long applicationId,
        Long jobId,
        Long userId,
        ApplicationStatus status,
        Instant createdAt,
        Integer score,
        String level,
        List<String> matchedSkills
) {}
