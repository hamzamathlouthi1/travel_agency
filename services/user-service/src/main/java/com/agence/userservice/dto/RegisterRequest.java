package com.agence.userservice.dto;

import com.agence.userservice.entity.Civilite;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(regexp = "^\\+?[1-9][0-9 ]{7,19}$", message = "Utilisez le format international, par exemple +21612345678")
    private String mobile;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, max = 72, message = "Le mot de passe doit contenir entre 8 et 72 caractères")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
            message = "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    )
    private String password;
}
