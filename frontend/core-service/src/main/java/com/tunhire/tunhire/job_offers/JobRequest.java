package com.tunhire.tunhire.job_offers;

import com.tunhire.tunhire.job_offers.entity.WorkMode;
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

    @NotNull(message = "Work mode is required") WorkMode workMode,

    BigDecimal salaryMin,

    BigDecimal salaryMax
) {}

