package com.tunhire.tunhire.chat;

public interface RecruiterCandidateEligibility {
    boolean canStartDirectChat(Long requesterUserId, Long targetUserId);
}
