package com.tunhire.tunhire.companies;

import com.tunhire.tunhire.applications.ApplicationSummary;

import java.util.List;

public record CompanyDashboardResponse(
		CompanyResponse company,
		List<JobSummaryDto> jobs,
		List<ApplicationSummary> applications
) {
}

