package com.tunhire.tunhire.applications;

import java.util.List;

public interface JobLookupService {
	List<Long> getJobIdsByCompanyId(Long companyId);
        boolean isRecruiterAuthorizedForJob(Long jobId, Long recruiterId);}