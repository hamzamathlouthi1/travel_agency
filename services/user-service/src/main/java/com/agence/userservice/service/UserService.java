package com.agence.userservice.service;

import com.agence.userservice.dto.AuthResponse;
import com.agence.userservice.dto.LoginRequest;
import com.agence.userservice.dto.RegisterRequest;
import com.agence.userservice.dto.UserResponse;
import com.agence.userservice.entity.User;
import com.agence.userservice.exception.EmailAlreadyExistsException;
import com.agence.userservice.exception.InvalidCredentialsException;
import com.agence.userservice.repository.UserRepository;
import com.agence.userservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Un compte existe déjà avec cet e-mail.");
        }

        User user = User.builder()
                .civilite(request.getCivilite())
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail());

        return new AuthResponse(token, toUserResponse(saved));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("E-mail ou mot de passe incorrect."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("E-mail ou mot de passe incorrect.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, toUserResponse(user));
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .civilite(user.getCivilite())
                .prenom(user.getPrenom())
                .nom(user.getNom())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .build();
    }
}
