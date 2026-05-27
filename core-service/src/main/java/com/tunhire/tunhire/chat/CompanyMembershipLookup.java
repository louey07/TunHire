package com.tunhire.tunhire.chat;

public interface CompanyMembershipLookup {
    boolean isMember(Long companyId, Long userId);
}
