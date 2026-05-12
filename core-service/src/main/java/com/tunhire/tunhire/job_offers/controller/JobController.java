package com.tunhire.tunhire.job_offers.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.common.ApiResponse;
import com.tunhire.tunhire.job_offers.JobRequest;
import com.tunhire.tunhire.job_offers.JobResponse;
import com.tunhire.tunhire.job_offers.JobService;
import com.tunhire.tunhire.job_offers.entity.JobStatus;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/jobs")
public class JobController {

    private final JobService jobService;
    private final AuthService authService;

    public JobController(JobService jobService, AuthService authService) {
        this.jobService = jobService;
        this.authService = authService;
    }

    /** POST /jobs — create a job (RECRUITER only) */
    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ApiResponse<JobResponse> create(
        @Valid @RequestBody JobRequest request,
        Authentication authentication
    ) {
        Long recruiterId = getAuthenticatedUserId(authentication);
        return ApiResponse.ok(
            "Job created",
            jobService.create(request, recruiterId)
        );
    }

    /** GET /jobs — list all active jobs */
    @GetMapping
    public ApiResponse<Page<JobResponse>> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok("Jobs fetched", jobService.getAll(page, size));
    }

    /** GET /jobs/{id} — get single job */
    @GetMapping("/{id}")
    public ApiResponse<JobResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok("Job fetched", jobService.getById(id));
    }

    /** PUT /jobs/{id} — update job (recruiter only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ApiResponse<JobResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody JobRequest request,
        Authentication authentication
    ) {
        Long recruiterId = getAuthenticatedUserId(authentication);
        return ApiResponse.ok(
            "Job updated",
            jobService.update(id, request, recruiterId)
        );
    }

    /** PATCH /jobs/{id}/status — update job status (recruiter only) */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ApiResponse<JobResponse> updateStatus(
        @PathVariable Long id,
        @RequestParam JobStatus status,
        Authentication authentication
    ) {
        Long recruiterId = getAuthenticatedUserId(authentication);
        return ApiResponse.ok(
            "Job status updated",
            jobService.updateStatus(id, status, recruiterId)
        );
    }

    /** DELETE /jobs/{id} — delete job (recruiter only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ApiResponse<Void> delete(
        @PathVariable Long id,
        Authentication authentication
    ) {
        Long recruiterId = getAuthenticatedUserId(authentication);
        jobService.delete(id, recruiterId);
        return ApiResponse.ok("Job deleted", null);
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        String email = authentication.getName();
        return authService.getUserIdByEmail(email);
    }
}

