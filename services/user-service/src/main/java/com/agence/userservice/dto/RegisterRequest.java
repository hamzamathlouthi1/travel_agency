package com.agence.userservice.dto;

import com.agence.userservice.entity.Civilite;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotNull(message = "La civilité est obligatoire (MR, MME ou MLLE)")
    private Civilite civilite;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'e-mail est obligatoire")
    @Email(message = "Format d'e-mail invalide")
    private String email;

    @NotBlank(message = "Le mobile est obligatoire")
    private String mobile;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;
}
