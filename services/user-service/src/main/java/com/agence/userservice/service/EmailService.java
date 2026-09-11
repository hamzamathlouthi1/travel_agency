package com.agence.userservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from-address:no-reply@agence.local}") private String fromAddress;
    @Value("${app.mail.from-name:Agence Travel}") private String fromName;

    public void sendVerificationCode(String toEmail, String code, long expirationMinutes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(String.format("%s <%s>", fromName, fromAddress));
        message.setTo(toEmail);
        message.setSubject("Your verification code");
        message.setText("""
                Welcome to Agence Travel!

                Your verification code is: %s

                Enter this code on the registration page to confirm your account.
                This code expires in %d minutes.

                If you didn't request this, you can safely ignore this e-mail.
                """.formatted(code, expirationMinutes));
        mailSender.send(message);
    }
}
