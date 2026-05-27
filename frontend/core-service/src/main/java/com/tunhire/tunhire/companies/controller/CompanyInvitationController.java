package com.tunhire.tunhire.companies.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.common.ApiResponse;
import com.tunhire.tunhire.companies.AcceptInviteRequest;
import com.tunhire.tunhire.companies.MembershipResponse;
import com.tunhire.tunhire.companies.service.MembershipService;
import java.security.Principal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/companies/invites")
public class CompanyInvitationController {

    private final MembershipService membershipService;
    private final AuthService authService;

    public CompanyInvitationController(MembershipService membershipService, AuthService authService) {
        this.membershipService = membershipService;
        this.authService = authService;
    }

    @PostMapping("/accept")
    public ApiResponse<MembershipResponse> acceptInvite(
            @RequestBody AcceptInviteRequest request,
            Principal principal) {
        Long currentUserId = authService.getUserIdByEmail(principal.getName());
        return ApiResponse.ok(
            "Invite accepted",
            membershipService.acceptInvite(request, currentUserId)
        );
    }
}
