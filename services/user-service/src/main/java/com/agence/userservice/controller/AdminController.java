package com.agence.userservice.controller;

import com.agence.userservice.dto.AdminSummaryResponse;
import com.agence.userservice.dto.UserResponse;
import com.agence.userservice.entity.Role;
import com.agence.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public AdminSummaryResponse summary() {
        return new AdminSummaryResponse(userRepository.count(),
                userRepository.countByRolesContaining(Role.CUSTOMER),
                userRepository.countByRolesContaining(Role.ADMIN)
                        + userRepository.countByRolesContaining(Role.SUPER_ADMIN));
    }

    // Note: kept as a plain array response (not a Page<> envelope) to avoid a breaking change
    // for the existing admin UI, which renders every result client-side. The `limit` param
    // still protects the DB from an unbounded SELECT * as the user table grows; once the
    // table is large enough to need true pagination, switch this to a Page<> response and
    // add pager UI on the frontend.
    @GetMapping("/users")
    public List<UserResponse> users(@RequestParam(defaultValue = "500") int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 1000);
        Pageable pageable = PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"));

        return userRepository.findAll(pageable)
                .map(user -> UserResponse.builder()
                        .id(user.getId()).civilite(user.getCivilite())
                        .prenom(user.getPrenom()).nom(user.getNom())
                        .email(user.getEmail()).mobile(user.getMobile())
                        .roles(user.getRoles()).createdAt(user.getCreatedAt()).build())
                .toList();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
