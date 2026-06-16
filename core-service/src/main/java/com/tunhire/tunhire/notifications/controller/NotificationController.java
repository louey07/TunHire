package com.tunhire.tunhire.notifications.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.auth.entity.Role;
import com.tunhire.tunhire.chat.UserRoleLookup;
import com.tunhire.tunhire.common.ApiResponse;
import com.tunhire.tunhire.notifications.NotificationBadgesDto;
import com.tunhire.tunhire.notifications.NotificationService;
import java.security.Principal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;
    private final UserRoleLookup userRoleLookup;

    public NotificationController(
        NotificationService notificationService,
        AuthService authService,
        UserRoleLookup userRoleLookup
    ) {
        this.notificationService = notificationService;
        this.authService = authService;
        this.userRoleLookup = userRoleLookup;
    }

    @GetMapping("/badges")
    @PreAuthorize("hasAnyRole('CANDIDATE','RECRUITER','ADMIN')")
    public ApiResponse<NotificationBadgesDto> getBadges(
        @RequestParam(required = false) Long companyId,
        Principal principal
    ) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        Role role = userRoleLookup.getRole(userId);
        return ApiResponse.ok(
            "Notification badges fetched",
            notificationService.getBadges(userId, role, companyId)
        );
    }

    @PostMapping("/recruiter/candidates-seen")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ApiResponse<Void> markRecruiterCandidatesSeen(
        @RequestParam Long companyId,
        Principal principal
    ) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        notificationService.markRecruiterCandidatesSeen(userId, companyId);
        return ApiResponse.ok("Candidates marked as seen", null);
    }

    @PostMapping("/candidate/applications-seen")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ApiResponse<Void> markCandidateApplicationsSeen(Principal principal) {
        Long userId = authService.getUserIdByEmail(principal.getName());
        notificationService.markCandidateApplicationsSeen(userId);
        return ApiResponse.ok("Applications marked as seen", null);
    }
}
