package com.tunhire.tunhire.job_offers;

import com.tunhire.tunhire.job_offers.entity.JobStatus;
import com.tunhire.tunhire.job_offers.entity.WorkMode;
import java.math.BigDecimal;
import java.time.Instant;

public record JobResponse(
    Long id,
    String title,
    Long companyId,
    String companyName,
    String companySlug,
    String companyLogoUrl,
    String companyLocation,
    String companyDescription,
    String companyWebsite,
    String location,
    String description,
    String contractType,
    String experienceLevel,
    WorkMode workMode,
    BigDecimal salaryMin,
    BigDecimal salaryMax,
    JobStatus status,
    Instant createdAt,
    Instant updatedAt
) {}

