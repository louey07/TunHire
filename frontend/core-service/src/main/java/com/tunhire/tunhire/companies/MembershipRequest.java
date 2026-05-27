package com.tunhire.tunhire.companies;


public record MembershipRequest(
    Long userId,
    MemberRole role
) {}

