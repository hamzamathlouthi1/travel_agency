package com.agence.userservice.service;

import com.agence.userservice.dto.AuthResponse;
import com.agence.userservice.dto.LoginRequest;
import com.agence.userservice.dto.RegisterRequest;
import com.agence.userservice.dto.PendingRegistrationResponse;
import com.agence.userservice.dto.UserResponse;
import com.agence.userservice.dto.VerifyEmailRequest;
import com.agence.userservice.entity.User;
import com.agence.userservice.entity.Role;
import com.agence.userservice.exception.EmailAlreadyExistsException;
import com.agence.userservice.exception.EmailVerificationException;
import com.agence.userservice.exception.InvalidCredentialsException;
import com.agence.userservice.exception.PendingEmailVerificationException;
import com.agence.userservice.repository.UserRepository;
import com.agence.userservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${app.mail.code-expiration-minutes:10}") private long codeExpirationMinutes;

    @Transactional
    public PendingRegistrationResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new EmailAlreadyExistsException("An account already exists with this email.");
        }

        String code = generateCode();
        LocalDateTime now = LocalDateTime.now();
        User user = User.builder()
                .civilite(request.getCivilite())
                .prenom(request.getPrenom().trim())
                .nom(request.getNom().trim())
                .email(email)
                .mobile(normalizePhone(request.getMobile()))
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .verificationId(UUID.randomUUID().toString())
                .verificationCodeHash(passwordEncoder.encode(code))
                .verificationCodeSentAt(now)
                .verificationCodeExpiresAt(now.plusMinutes(codeExpirationMinutes))
                .verificationAttempts(0)
                .build();

        User saved = userRepository.save(user);
        emailService.sendVerificationCode(saved.getEmail(), code, codeExpirationMinutes);

        return new PendingRegistrationResponse(saved.getVerificationId(), maskEmail(saved.getEmail()),
                codeExpirationMinutes * 60, "We've sent a verification code to your e-mail address.");
    }

    @Transactional
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        User user = findVerification(request.verificationId());

        if (user.isEmailVerified()) {
            throw new EmailVerificationException("This account is already verified.");
        }
        if (user.getVerificationCodeExpiresAt() == null
                || LocalDateTime.now().isAfter(user.getVerificationCodeExpiresAt())) {
            throw new EmailVerificationException("The verification code has expired. Request a new one.");
        }
        if (user.getVerificationAttempts() >= 5) {
            throw new EmailVerificationException("Too many verification attempts. Request a new code.");
        }
        if (user.getVerificationCodeHash() == null
                || !passwordEncoder.matches(request.code(), user.getVerificationCodeHash())) {
            user.setVerificationAttempts(user.getVerificationAttempts() + 1);
            userRepository.save(user);
            throw new EmailVerificationException("Invalid verification code.");
        }

        user.setEmailVerified(true);
        user.setVerificationCodeHash(null);
        user.setVerificationCodeExpiresAt(null);
        user.setVerificationCodeSentAt(null);
        user.setVerificationAttempts(0);
        user.setVerificationId(null);
        userRepository.save(user);

        return authenticate(user);
    }

    @Transactional
    public PendingRegistrationResponse resendVerificationCode(String verificationId) {
        User user = findVerification(verificationId);
        if (user.isEmailVerified()) {
            throw new EmailVerificationException("This account is already verified.");
        }

        String code = generateCode();
        LocalDateTime now = LocalDateTime.now();
        user.setVerificationCodeHash(passwordEncoder.encode(code));
        user.setVerificationCodeSentAt(now);
        user.setVerificationCodeExpiresAt(now.plusMinutes(codeExpirationMinutes));
        user.setVerificationAttempts(0);
        userRepository.save(user);

        emailService.sendVerificationCode(user.getEmail(), code, codeExpirationMinutes);

        return new PendingRegistrationResponse(user.getVerificationId(), maskEmail(user.getEmail()),
                codeExpirationMinutes * 60, "We've sent you a new verification code.");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new InvalidCredentialsException("E-mail ou mot de passe incorrect."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("E-mail ou mot de passe incorrect.");
        }

        if (!user.isEmailVerified()) {
            throw new PendingEmailVerificationException(user.getVerificationId(), maskEmail(user.getEmail()));
        }

        // Backfill accounts created before role-based authorization was added.
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(new HashSet<>(Set.of(Role.CUSTOMER)));
            userRepository.save(user);
        }

        return authenticate(user);
    }

    private User findVerification(String verificationId) {
        return userRepository.findByVerificationId(verificationId)
                .orElseThrow(() -> new EmailVerificationException("Registration not found or already completed."));
    }

    private AuthResponse authenticate(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles());
        return new AuthResponse(token, toUserResponse(user));
    }

    private String generateCode() {
        return "%06d".formatted(SECURE_RANDOM.nextInt(1_000_000));
    }

    private String normalizePhone(String phone) {
        String digits = digitsOnly(phone);
        return digits.isBlank() ? "" : "+" + digits;
    }

    private String digitsOnly(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) return email;
        String local = email.substring(0, at);
        String domain = email.substring(at);
        String visible = local.substring(0, Math.min(2, local.length()));
        return visible + "*".repeat(Math.max(1, local.length() - visible.length())) + domain;
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .civilite(user.getCivilite())
                .prenom(user.getPrenom())
                .nom(user.getNom())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .roles(user.getRoles())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
