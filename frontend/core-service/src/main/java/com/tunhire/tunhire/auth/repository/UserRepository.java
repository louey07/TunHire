package com.tunhire.tunhire.auth.repository;

import com.tunhire.tunhire.auth.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    /** Find a user by their email address */
    Optional<User> findByEmail(String email);

    /** Check if an email is already registered */
    boolean existsByEmail(String email);
}

