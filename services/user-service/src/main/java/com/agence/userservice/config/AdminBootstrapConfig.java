package com.agence.userservice.config;

import com.agence.userservice.entity.Civilite;
import com.agence.userservice.entity.Role;
import com.agence.userservice.entity.User;
import com.agence.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class AdminBootstrapConfig {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner bootstrapAdmin(@Value("${app.admin.email:}") String email,
                                     @Value("${app.admin.password:}") String password) {
        return args -> {
            if (email.isBlank() || password.isBlank()) return;
            User admin = userRepository.findByEmail(email).orElseGet(() -> User.builder()
                    .civilite(Civilite.MR).prenom("Platform").nom("Admin")
                    .email(email).mobile("00000000")
                    .password(passwordEncoder.encode(password)).build());
            admin.setRoles(new HashSet<>(Set.of(Role.SUPER_ADMIN)));
            userRepository.save(admin);
        };
    }
}
