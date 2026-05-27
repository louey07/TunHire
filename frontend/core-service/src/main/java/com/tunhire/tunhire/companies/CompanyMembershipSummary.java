package com.tunhire.tunhire.companies;

import java.time.LocalDateTime;

public record CompanyMembershipSummary(
    Long companyId,
    String companyName,
    String slug,
    String logoUrl,
    String location,
    MemberRole role,
    LocalDateTime joinedAt
) {}
