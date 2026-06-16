package com.tunhire.tunhire.auth.service;

import com.tunhire.tunhire.auth.entity.Role;
import com.tunhire.tunhire.auth.repository.UserRepository;
import com.tunhire.tunhire.chat.UserRoleLookup;
import com.tunhire.tunhire.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthUserRoleLookup implements UserRoleLookup {

    private final UserRepository userRepository;

    public AuthUserRoleLookup(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Role getRole(Long userId) {
        return userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"))
            .getRole();
    }
}
