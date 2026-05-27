package com.tunhire.tunhire.auth;

import com.tunhire.tunhire.auth.entity.Role;

import java.time.Instant;

public record UserDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        Role role,
        Instant createdAt
) {}
