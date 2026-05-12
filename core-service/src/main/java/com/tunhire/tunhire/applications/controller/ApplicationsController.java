package com.tunhire.tunhire.applications.controller;

import com.tunhire.tunhire.applications.ApplicationCreateRequest;
import com.tunhire.tunhire.applications.ApplicationResponse;
import com.tunhire.tunhire.applications.ApplicationSummary;
import com.tunhire.tunhire.applications.ApplicationService;
import com.tunhire.tunhire.applications.RankedApplicationResponse;
import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.common.ApiResponse;
import java.security.Principal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.tunhire.tunhire.applications.entity.ApplicationStatus;

@RestController
@RequestMapping("/applications")
public class ApplicationsController {

    private final ApplicationService applicationService;
    private final AuthService authService;

    public ApplicationsController(
        ApplicationService applicationService,
        AuthService authService
    ) {
        this.applicationService = applicationService;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ApiResponse<ApplicationResponse> create(
        @RequestBody ApplicationCreateRequest request,
        Principal principal
    ) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        return ApiResponse.ok(
            "Application created",
            applicationService.create(request, userId)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<ApplicationResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(
            "Application fetched",
            applicationService.getById(id)
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ApiResponse<ApplicationResponse> updateStatus(
        @PathVariable Long id,
        @RequestParam ApplicationStatus status,
        Principal principal
    ) {
        Long recruiterId = authService.getUserIdByEmail(principal.getName());
        return ApiResponse.ok(
            "Application status updated",
            applicationService.updateStatus(id, status, recruiterId)
        );
    }

    @GetMapping("/job/{jobId}/ranked")
    @PreAuthorize("hasRole('RECRUITER')")
    public ApiResponse<List<RankedApplicationResponse>> getRankedByJob(
        @PathVariable Long jobId
    ) {
        return ApiResponse.ok(
            "Ranked applications fetched",
            applicationService.getRankedByJobId(jobId)
        );
    }

    @GetMapping
    public ApiResponse<List<ApplicationSummary>> list(
        @RequestParam(required = false) Long jobId,
        @RequestParam(required = false) Long userId
    ) {
        if (jobId != null) {
            return ApiResponse.ok(
                "Applications fetched",
                applicationService.getByJobId(jobId)
            );
        }
        if (userId != null) {
            return ApiResponse.ok(
                "Applications fetched",
                applicationService.getByUserId(userId)
            );
        }
        return ApiResponse.ok("Applications fetched", List.of());
    }
}

