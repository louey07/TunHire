package com.tunhire.tunhire.companies;

import com.tunhire.tunhire.applications.entity.ApplicationStatus;
import java.time.Instant;

public record DashboardApplicationItem(
    Long id,
    Long jobId,
    String jobTitle,
    Long userId,
    String candidateFirstName,
    String candidateLastName,
    ApplicationStatus status,
    Instant createdAt
) {}
