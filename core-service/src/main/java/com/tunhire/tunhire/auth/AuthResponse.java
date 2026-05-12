package com.tunhire.tunhire.auth;

public record AuthResponse(
        String token,
        UserDto user
) {}
