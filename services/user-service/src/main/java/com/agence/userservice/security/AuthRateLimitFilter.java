package com.agence.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Lightweight in-memory rate limiter for the public /api/auth/** endpoints
 * (login, register, verify-email, resend-verification), keyed by client IP.
 *
 * This is a fixed-window counter, which is intentionally simple and dependency-free.
 * It is sufficient for a single-instance deployment; if the service is ever scaled
 * horizontally, replace this with a shared store (e.g. Redis) so the limit is
 * enforced across instances rather than per-instance.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final String PROTECTED_PREFIX = "/api/auth/";

    @Value("${app.rate-limit.auth.max-requests:20}")
    private int maxRequestsPerWindow;

    @Value("${app.rate-limit.auth.window-seconds:60}")
    private long windowSeconds;

    private final Map<String, Window> buckets = new ConcurrentHashMap<>();

    /** Mutable per-key counter. Plain class (not a record) since fields need to be mutable/volatile. */
    private static final class Window {
        private final AtomicInteger count = new AtomicInteger(0);
        private final AtomicReference<Instant> windowStart = new AtomicReference<>(Instant.now());
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith(PROTECTED_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String key = clientKey(request);
        Window window = buckets.computeIfAbsent(key, k -> new Window());

        Instant now = Instant.now();
        synchronized (window) {
            if (now.isAfter(window.windowStart.get().plusSeconds(windowSeconds))) {
                window.count.set(0);
                window.windowStart.set(now);
            }
        }

        int attempts = window.count.incrementAndGet();

        if (attempts > maxRequestsPerWindow) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":429,\"message\":\"Too many requests. Please wait a moment and try again.\"}");
            return;
        }

        // Opportunistic cleanup so the map doesn't grow unbounded under many distinct IPs.
        if (buckets.size() > 10_000) {
            buckets.entrySet().removeIf(e ->
                    now.isAfter(e.getValue().windowStart.get().plusSeconds(windowSeconds * 2)));
        }

        filterChain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
