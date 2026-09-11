package com.agence.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Civilite civilite;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 20)
    private String mobile;

    @Column(nullable = false)
    private String password;

    @Column(name = "email_verified", nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private boolean emailVerified = true;

    @Column(name = "verification_code_hash")
    private String verificationCodeHash;

    @Column(name = "verification_code_expires_at")
    private LocalDateTime verificationCodeExpiresAt;

    @Column(name = "verification_code_sent_at")
    private LocalDateTime verificationCodeSentAt;

    @Column(name = "verification_attempts", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private int verificationAttempts = 0;

    @Column(name = "verification_id", unique = true, length = 36)
    private String verificationId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private Set<Role> roles = new HashSet<>(Set.of(Role.CUSTOMER));

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.roles == null || this.roles.isEmpty()) {
            this.roles = new HashSet<>(Set.of(Role.CUSTOMER));
        }
    }
}
