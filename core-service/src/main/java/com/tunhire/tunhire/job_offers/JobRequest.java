package com.tunhire.tunhire.job_offers;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record JobRequest(
    @NotBlank(message = "Title is required") String title,

    @NotNull(message = "Company ID is required") Long companyId,

    @NotBlank(message = "Location is required") String location,

    @NotBlank(message = "Description is required") String description,

    String contractType,

    String experienceLevel,

    BigDecimal salaryMin,

    BigDecimal salaryMax
) {}

