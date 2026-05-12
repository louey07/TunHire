package com.tunhire.tunhire.applications;

import com.tunhire.tunhire.applications.entity.ApplicationStatus;

import java.time.Instant;

public record ApplicationResponse(
		Long id,
		Long jobId,
		Long userId,
		String candidateFirstName,
		String candidateLastName,
		String resumeUrl,
		ApplicationStatus status,
		Instant createdAt
) {
}

