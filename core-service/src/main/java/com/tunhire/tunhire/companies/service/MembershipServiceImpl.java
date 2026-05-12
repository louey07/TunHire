package com.tunhire.tunhire.companies.service;

import com.tunhire.tunhire.common.ResourceNotFoundException;
import com.tunhire.tunhire.companies.AcceptInviteRequest;
import com.tunhire.tunhire.companies.InviteTokenResponse;
import com.tunhire.tunhire.companies.MembershipRequest;
import com.tunhire.tunhire.companies.MembershipResponse;
import com.tunhire.tunhire.companies.entity.CompanyInvitation;
import com.tunhire.tunhire.companies.entity.CompanyMembership;
import com.tunhire.tunhire.companies.MemberRole;
import com.tunhire.tunhire.companies.repository.CompanyInvitationRepository;
import com.tunhire.tunhire.companies.repository.CompanyMembershipRepository;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.tunhire.tunhire.common.CompanyCreatedEvent;

@Service
@Transactional
public class MembershipServiceImpl implements MembershipService {

    private final CompanyMembershipRepository membershipRepository;
    private final CompanyInvitationRepository invitationRepository;

    public MembershipServiceImpl(
            CompanyMembershipRepository membershipRepository,
            CompanyInvitationRepository invitationRepository) {
        this.membershipRepository = membershipRepository;
        this.invitationRepository = invitationRepository;
    }

    @ApplicationModuleListener
    void onCompanyCreated(CompanyCreatedEvent event) {
        CompanyMembership newMember = CompanyMembership.builder()
            .companyId(event.companyId())
            .userId(event.creatorUserId())
            .role(MemberRole.RECRUITER_ADMIN)
            .build();
        membershipRepository.save(newMember);
    }

    @Override
    public boolean isMember(Long companyId, Long userId) {
        return membershipRepository.existsByCompanyIdAndUserId(companyId, userId);
    }

    @Override
    public boolean isRecruiterAdmin(Long companyId, Long userId) {
        return membershipRepository.existsByCompanyIdAndUserIdAndRoleIn(companyId, userId, List.of(MemberRole.RECRUITER_ADMIN));
    }

    @Override
    public Long getCompanyIdByUserId(Long userId) {
        return membershipRepository.findByUserId(userId)
            .stream().findFirst()
            .map(m -> m.getCompanyId())
            .orElseThrow(() -> new IllegalArgumentException("User does not belong to any company"));
    }

    @Override
    public MembershipResponse addMember(Long companyId, MembershipRequest request, Long currentUserId) {
        boolean hasMembers = !membershipRepository.findByCompanyId(companyId).isEmpty();
        if (hasMembers && !isRecruiterAdmin(companyId, currentUserId)) {
            throw new IllegalArgumentException("You do not have permission to add members");
        }
        CompanyMembership newMember = CompanyMembership.builder()
            .companyId(companyId)
            .userId(request.userId())
            .role(request.role())
            .build();
        newMember = membershipRepository.save(newMember);
        return toResponse(newMember);
    }

    @Override
    public void removeMember(Long companyId, Long userIdToRemove, Long currentUserId) {
        if (!isRecruiterAdmin(companyId, currentUserId)) {
            throw new IllegalArgumentException("You do not have permission to remove members");
        }
        CompanyMembership member = membershipRepository.findByCompanyIdAndUserId(companyId, userIdToRemove)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        if (member.getRole() == MemberRole.RECRUITER_ADMIN && userIdToRemove.equals(currentUserId)) {
            throw new IllegalArgumentException("Admins cannot remove themselves");
        }
        membershipRepository.delete(member);
    }

    @Override
    public MembershipResponse updateMemberRole(Long companyId, Long userIdToUpdate, MemberRole newRole, Long currentUserId) {
        if (!isRecruiterAdmin(companyId, currentUserId)) {
            throw new IllegalArgumentException("You do not have permission to update members");
        }
        CompanyMembership member = membershipRepository.findByCompanyIdAndUserId(companyId, userIdToUpdate)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        member.setRole(newRole);
        return toResponse(membershipRepository.save(member));
    }

    @Override
    public List<MembershipResponse> getMembers(Long companyId, Long currentUserId) {
        if (!isMember(companyId, currentUserId)) {
            throw new IllegalArgumentException("You do not have permission to view members");
        }
        return membershipRepository.findByCompanyId(companyId).stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public InviteTokenResponse generateInviteToken(Long companyId, Long currentUserId) {
        if (!isRecruiterAdmin(companyId, currentUserId)) {
            throw new IllegalArgumentException("Only admins can generate invite links.");
        }

        CompanyInvitation invite = CompanyInvitation.builder()
                .token(UUID.randomUUID().toString())
                .companyId(companyId)
                .createdByUserId(currentUserId)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .isUsed(false)
                .build();

        invitationRepository.save(invite);
        return new InviteTokenResponse(invite.getToken());
    }

    @Override
    public MembershipResponse acceptInvite(AcceptInviteRequest request, Long currentUserId) {
        CompanyInvitation invite = invitationRepository.findByToken(request.token())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invite token."));

        if (invite.isUsed()) {
            throw new IllegalArgumentException("This invite link has already been used.");
        }
        if (invite.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("This invite link has expired.");
        }

        if (isMember(invite.getCompanyId(), currentUserId)) {
            throw new IllegalArgumentException("You are already a member of this company.");
        }

        invite.setUsed(true);
        invitationRepository.save(invite);

        CompanyMembership newMember = CompanyMembership.builder()
                .companyId(invite.getCompanyId())
                .userId(currentUserId)
                .role(MemberRole.MEMBER)
                .build();

        return toResponse(membershipRepository.save(newMember));
    }

    private MembershipResponse toResponse(CompanyMembership membership) {
        return new MembershipResponse(
            membership.getId(),
            membership.getCompanyId(),
            membership.getUserId(),
            membership.getRole(),
            membership.getJoinedAt()
        );
    }
}

