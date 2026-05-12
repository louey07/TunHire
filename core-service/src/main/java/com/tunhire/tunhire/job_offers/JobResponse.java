package com.tunhire.tunhire.job_offers;

import java.math.BigDecimal;
import java.time.Instant;
import com.tunhire.tunhire.job_offers.entity.JobStatus;

public record JobResponse(
    Long id,
    String title,
    Long companyId,
    String companyName,
    String location,
    String description,
    String contractType,
    String experienceLevel,
    BigDecimal salaryMin,
    BigDecimal salaryMax,
    JobStatus status,
    Instant createdAt,
    Instant updatedAt
) {}

