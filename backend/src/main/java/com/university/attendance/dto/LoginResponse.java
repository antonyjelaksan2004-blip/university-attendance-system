package com.university.attendance.dto;

import com.university.attendance.model.Role;

public class LoginResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private String studentNumber;
    private Long batchId;

    public LoginResponse(String token, Long userId, String name, String email, Role role, String studentNumber, Long batchId) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.studentNumber = studentNumber;
        this.batchId = batchId;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getStudentNumber() {
        return studentNumber;
    }

    public Long getBatchId() {
        return batchId;
    }
}
