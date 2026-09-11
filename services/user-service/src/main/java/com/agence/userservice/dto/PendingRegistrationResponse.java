package com.agence.userservice.dto;

public record PendingRegistrationResponse(
        String verificationId,
        String maskedEmail,
        long expiresInSeconds,
        String message
) {}
