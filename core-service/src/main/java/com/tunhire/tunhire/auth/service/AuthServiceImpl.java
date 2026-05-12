package com.tunhire.tunhire.auth.service;
import com.tunhire.tunhire.auth.AuthService;
import com.tunhire.tunhire.auth.CandidateRegisteredEvent;

import com.tunhire.tunhire.auth.AuthResponse;
import com.tunhire.tunhire.auth.LoginRequest;
import com.tunhire.tunhire.auth.RegisterRequest;
import com.tunhire.tunhire.auth.UserDto;
import com.tunhire.tunhire.auth.entity.User;
import com.tunhire.tunhire.auth.repository.UserRepository;
import com.tunhire.tunhire.auth.security.JwtUtil;
import com.tunhire.tunhire.common.InvalidCredentialsException;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ApplicationEventPublisher events;

    public AuthServiceImpl(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtUtil jwtUtil,
        ApplicationEventPublisher events
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.events = events;
    }

    /**
     * Register a new user:
     * 1. Check email not already taken
     * 2. Hash the password
     * 3. Save user to database
     * 4. Generate and return JWT token
     */
    @Override
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException(
                "Email already registered: " + request.email()
            );
        }

        // Build the new user entity
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        user.setRole(request.role());

        // Save to database
        User saved = userRepository.save(user);
        
        // Publish event for candidate registration
        if (saved.getRole() == com.tunhire.tunhire.auth.entity.Role.CANDIDATE) {
            events.publishEvent(new CandidateRegisteredEvent(saved.getId()));
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            saved.getEmail(),
            saved.getRole().name()
        );

        return new AuthResponse(token, toDto(saved));
    }

    /**
     * Login:
     * 1. Find user by email
     * 2. Check password matches
     * 3. Generate and return JWT token
     */
    @Override
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        java.util.Optional<User> userOpt = userRepository.findByEmail(request.email());

        if (userOpt.isEmpty()) {
            // Mitigate timing attack by performing a dummy password check
            passwordEncoder.matches(request.password(), passwordEncoder.encode("dummy"));
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userOpt.get();

        // Check password
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getRole().name()
        );

        return new AuthResponse(token, toDto(user));
    }

    /**
     * Get current user by email extracted from JWT token
     */
    @Override
    public UserDto getCurrentUser(String email) {
        User user = userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toDto(user);
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toDto(user);
    }

    @Override
    public Long getUserIdByEmail(String email) {
        return userRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"))
            .getId();
    }

    /**
     * Convert User entity to UserDto (never expose password)
     */
    private UserDto toDto(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhone(),
            user.getRole(),
            user.getCreatedAt()
        );
    }
}

