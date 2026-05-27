package com.tunhire.tunhire.companies;

import java.util.List;

public record CompanyDashboardResponse(
    CompanyResponse company,
    List<JobSummaryDto> jobs,
    List<DashboardApplicationItem> applications
) {}
