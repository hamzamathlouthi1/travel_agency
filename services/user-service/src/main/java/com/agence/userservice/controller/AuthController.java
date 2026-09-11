package com.agence.userservice.controller;

import com.agence.userservice.dto.AuthResponse;
import com.agence.userservice.dto.LoginRequest;
import com.agence.userservice.dto.RegisterRequest;
import com.agence.userservice.dto.PendingRegistrationResponse;
import com.agence.userservice.dto.VerifyEmailRequest;
import com.agence.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<PendingRegistrationResponse> register(@Valid @RequestBody RegisterRequest request) {
        PendingRegistrationResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(userService.verifyEmail(request));
    }

    @PostMapping("/resend-verification/{verificationId}")
    public ResponseEntity<PendingRegistrationResponse> resendVerification(@PathVariable String verificationId) {
        return ResponseEntity.ok(userService.resendVerificationCode(verificationId));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }
}
