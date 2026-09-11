package com.agence.userservice.dto;

import com.agence.userservice.entity.Civilite;
import com.agence.userservice.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private Civilite civilite;
    private String prenom;
    private String nom;
    private String email;
    private String mobile;
    private Set<Role> roles;
    private LocalDateTime createdAt;
}
