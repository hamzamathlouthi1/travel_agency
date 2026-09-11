package com.agence.userservice.repository;

import com.agence.userservice.entity.User;
import com.agence.userservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByVerificationId(String verificationId);

    boolean existsByEmail(String email);

    long countByRolesContaining(Role role);
}
