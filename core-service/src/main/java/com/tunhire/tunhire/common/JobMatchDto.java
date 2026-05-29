package com.tunhire.tunhire.common;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record JobMatchDto(
    String title,
    String description,
    String location,
    @JsonProperty("work_mode") String workMode,
    @JsonProperty("contract_type") String contractType,
    @JsonProperty("experience_level") String experienceLevel,
    @JsonProperty("salary_min") Double salaryMin,
    @JsonProperty("salary_max") Double salaryMax
) {}
