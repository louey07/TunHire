package com.tunhire.tunhire.companies.service;

import com.tunhire.tunhire.chat.CompanyMembershipLookup;
import org.springframework.stereotype.Service;

@Service
public class CompanyMembershipLookupImpl implements CompanyMembershipLookup {

    private final MembershipService membershipService;

    public CompanyMembershipLookupImpl(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @Override
    public boolean isMember(Long companyId, Long userId) {
        return membershipService.isMember(companyId, userId);
    }
}
