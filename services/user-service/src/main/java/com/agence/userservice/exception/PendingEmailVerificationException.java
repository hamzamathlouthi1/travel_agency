package com.agence.userservice.exception;

public class PendingEmailVerificationException extends RuntimeException {
    private final String verificationId;
    private final String maskedEmail;

    public PendingEmailVerificationException(String verificationId, String maskedEmail) {
        super("Please verify your e-mail address before signing in.");
        this.verificationId = verificationId;
        this.maskedEmail = maskedEmail;
    }

    public String getVerificationId() {
        return verificationId;
    }

    public String getMaskedEmail() {
        return maskedEmail;
    }
}
