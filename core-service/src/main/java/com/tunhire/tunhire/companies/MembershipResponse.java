package com.tunhire.tunhire.companies;

import java.time.LocalDateTime;

public record MembershipResponse(
    Long id,
    Long companyId,
    Long userId,
    String firstName,
    String lastName,
    String email,
    MemberRole role,
    LocalDateTime joinedAt
) {}

