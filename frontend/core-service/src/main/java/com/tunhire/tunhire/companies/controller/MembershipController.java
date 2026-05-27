package com.tunhire.tunhire.companies.controller;

import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.companies.InviteTokenResponse;
import com.tunhire.tunhire.companies.MembershipRequest;
import com.tunhire.tunhire.companies.MembershipResponse;
import com.tunhire.tunhire.companies.MemberRole;
import com.tunhire.tunhire.companies.service.MembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/companies/{companyId}/members")
public class MembershipController {

    private final MembershipService membershipService;
    private final AuthService authService;

    public MembershipController(MembershipService membershipService, AuthService authService) {
        this.membershipService = membershipService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<MembershipResponse>> getMembers(
            @PathVariable Long companyId,
            Principal principal) {
        Long currentUserId = authService.getUserIdByEmail(principal.getName());
        return ResponseEntity.ok(membershipService.getMembers(companyId, currentUserId));
    }

    @PostMapping
    public ResponseEntity<MembershipResponse> addMember(
            @PathVariable Long companyId,
            @RequestBody MembershipRequest request,
            Principal principal) {
        Long currentUserId = authService.getUserIdByEmail(principal.getName());
        return ResponseEntity.ok(membershipService.addMember(companyId, request, currentUserId));
    }

    @PostMapping("/invites")
    public ResponseEntity<InviteTokenResponse> generateInviteToken(
            @PathVariable Long companyId,
            Principal principal) {
        Long currentUserId = authService.getUserIdByEmail(principal.getName());
        return ResponseEntity.ok(membershipService.generateInviteToken(companyId, currentUserId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long companyId,
            @PathVariable Long userId,
            Principal principal) {
        Long currentUserId = authService.getUserIdByEmail(principal.getName());
        membershipService.removeMember(companyId, userId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<MembershipResponse> updateMemberRole(
            @PathVariable Long companyId,
            @PathVariable Long userId,
            @RequestParam MemberRole role,
            Principal principal) {
        Long currentUserId = authService.getUserIdByEmail(principal.getName());
        return ResponseEntity.ok(membershipService.updateMemberRole(companyId, userId, role, currentUserId));
    }
}

