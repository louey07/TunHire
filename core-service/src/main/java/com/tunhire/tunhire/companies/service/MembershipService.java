package com.tunhire.tunhire.companies.service;

import com.tunhire.tunhire.companies.AcceptInviteRequest;
import com.tunhire.tunhire.companies.InviteTokenResponse;
import com.tunhire.tunhire.companies.CompanyMembershipSummary;
import com.tunhire.tunhire.companies.MembershipRequest;
import com.tunhire.tunhire.companies.MembershipResponse;
import com.tunhire.tunhire.companies.MemberRole;
import java.util.List;

public interface MembershipService {
    boolean isMember(Long companyId, Long userId);
    boolean isRecruiterAdmin(Long companyId, Long userId);
    Long getCompanyIdByUserId(Long userId);
    MembershipResponse addMember(Long companyId, MembershipRequest request, Long currentUserId);
    void removeMember(Long companyId, Long userIdToRemove, Long currentUserId);
    MembershipResponse updateMemberRole(Long companyId, Long userIdToUpdate, MemberRole newRole, Long currentUserId);
    List<MembershipResponse> getMembers(Long companyId, Long currentUserId);
    List<CompanyMembershipSummary> getCompaniesForUser(Long userId);
    MembershipResponse addCreatorAsAdmin(Long companyId, Long userId);

    InviteTokenResponse generateInviteToken(Long companyId, Long currentUserId);
    MembershipResponse acceptInvite(AcceptInviteRequest request, Long currentUserId);
}

