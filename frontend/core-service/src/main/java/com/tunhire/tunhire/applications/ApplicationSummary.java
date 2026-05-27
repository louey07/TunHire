package com.tunhire.tunhire.applications;

import com.tunhire.tunhire.applications.entity.ApplicationStatus;

import java.time.Instant;

public record ApplicationSummary(
		Long id,
		Long jobId,
		Long userId,
		ApplicationStatus status,
		Instant createdAt
) {
}

