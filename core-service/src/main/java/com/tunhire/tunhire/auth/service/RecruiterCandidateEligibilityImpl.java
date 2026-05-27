package com.tunhire.tunhire.auth.service;

import com.tunhire.tunhire.auth.entity.Role;
import com.tunhire.tunhire.chat.RecruiterCandidateEligibility;
import com.tunhire.tunhire.chat.UserRoleLookup;
import org.springframework.stereotype.Service;

@Service
public class RecruiterCandidateEligibilityImpl
    implements RecruiterCandidateEligibility {

    private final UserRoleLookup userRoleLookup;

    public RecruiterCandidateEligibilityImpl(UserRoleLookup userRoleLookup) {
        this.userRoleLookup = userRoleLookup;
    }

    @Override
    public boolean canStartDirectChat(Long requesterUserId, Long targetUserId) {
        Role requester = userRoleLookup.getRole(requesterUserId);
        Role target = userRoleLookup.getRole(targetUserId);
        return requester == Role.RECRUITER && target == Role.CANDIDATE;
    }
}
