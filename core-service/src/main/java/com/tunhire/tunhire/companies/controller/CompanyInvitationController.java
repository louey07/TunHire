package com.tunhire.tunhire.companies.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.companies.AcceptInviteRequest;
import com.tunhire.tunhire.companies.MembershipResponse;
import com.tunhire.tunhire.companies.service.MembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

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
    public ResponseEntity<MembershipResponse> acceptInvite(
            @RequestBody AcceptInviteRequest request,
            Principal principal) {
        Long currentUserId = authService.getUserIdByEmail(principal.getName());
        return ResponseEntity.ok(membershipService.acceptInvite(request, currentUserId));
    }
}