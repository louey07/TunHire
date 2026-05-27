package com.tunhire.tunhire.companies;


import java.util.List;

public interface JobSummaryProvider {
	List<JobSummaryDto> getJobsByCompanyId(Long companyId);
}

