package com.tunhire.tunhire.auth;

public interface AuthService {
    /**
     * Register a new user and return a JWT token
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Login with email and password, return a JWT token
     */
    AuthResponse login(LoginRequest request);

    /**
     * Get the currently authenticated user by email
     */
    UserDto getCurrentUser(String email);

    /**
     * Get the user ID by email
     */
    Long getUserIdByEmail(String email);

    /**
     * Get the user by ID
     */
    UserDto getUserById(Long id);
}

