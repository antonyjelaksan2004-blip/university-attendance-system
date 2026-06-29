package com.university.attendance.service;

import com.university.attendance.dto.LoginRequest;
import com.university.attendance.dto.LoginResponse;
import com.university.attendance.model.User;
import com.university.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String password = request.getPassword() == null ? "" : request.getPassword().trim();

        User user = userRepository.findByEmailIgnoreCaseAndDeletedFalseOrderByIdDesc(email)
                .stream()
                .filter(item -> item.getPassword() != null && item.getPassword().trim().equals(password))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        String tokenValue = user.getEmail() + ":" + user.getRole() + ":" + Instant.now();
        String token = Base64.getEncoder().encodeToString(tokenValue.getBytes(StandardCharsets.UTF_8));
        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getStudentNumber(), user.getBatchId());
    }
}
