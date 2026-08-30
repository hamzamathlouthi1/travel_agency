package com.agence.userservice.dto;

import com.agence.userservice.entity.Civilite;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

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
}
