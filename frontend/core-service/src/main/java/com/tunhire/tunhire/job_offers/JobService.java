package com.tunhire.tunhire.job_offers;

import org.springframework.data.domain.Page;
import com.tunhire.tunhire.job_offers.entity.JobStatus;

public interface JobService {

    /** Create a new job — only RECRUITER can do this */
    JobResponse create(JobRequest request, Long recruiterId);

    /** Get all active jobs */
    Page<JobResponse> getAll(int page, int size);

    /** Get a single job by id */
    JobResponse getById(Long id);

    /** Update a job — only the recruiter can do this */
    JobResponse update(Long id, JobRequest request, Long recruiterId);

    /** Update job status — e.g. DRAFT to ACCEPTED, or CANCELED */
    JobResponse updateStatus(Long id, JobStatus status, Long recruiterId);

    /** Delete a job — only the  recruiter can do this */
    void delete(Long id, Long recruiterId);
}
