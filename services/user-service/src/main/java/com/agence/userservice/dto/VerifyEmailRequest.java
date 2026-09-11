package com.agence.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailRequest(
        @NotBlank String verificationId,
        @NotBlank @Pattern(regexp = "\\d{6}") String code
) {}
