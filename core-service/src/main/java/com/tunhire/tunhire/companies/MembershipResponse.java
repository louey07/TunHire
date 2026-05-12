package com.tunhire.tunhire.companies;

import java.time.LocalDateTime;

public record MembershipResponse(
    Long id,
    Long companyId,
    Long userId,
    MemberRole role,
    LocalDateTime joinedAt
) {}

