package com.tunhire.tunhire.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tunhire.tunhire.auth.AuthResponse;
import com.tunhire.tunhire.auth.LoginRequest;
import com.tunhire.tunhire.auth.RegisterRequest;
import com.tunhire.tunhire.auth.UserDto;
import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.common.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /auth/register
     * Create a new user account
     * Body: { email, password, firstName, lastName, phone, role }
     */
    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.ok("User registered successfully", response);
    }

    /**
     * POST /auth/login
     * Login with email and password
     * Body: { email, password }
     */
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.ok("Login successful", response);
    }

    /**
     * GET /auth/me
     * Get the currently logged in user
     * Requires: Authorization: Bearer <token>
     */
    @GetMapping("/me")
    public ApiResponse<UserDto> me(Authentication authentication) {
        // authentication.getName() returns the email we put in the JWT subject
        UserDto user = authService.getCurrentUser(authentication.getName());
        return ApiResponse.ok("User fetched", user);
    }
}

