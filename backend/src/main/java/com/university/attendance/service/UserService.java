package com.university.attendance.service;

import com.university.attendance.model.DeletedRecord;
import com.university.attendance.model.Role;
import com.university.attendance.model.User;
import com.university.attendance.repository.DeletedRecordRepository;
import com.university.attendance.repository.UserRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final DeletedRecordRepository deletedRecordRepository;

    public UserService(UserRepository userRepository, DeletedRecordRepository deletedRecordRepository) {
        this.userRepository = userRepository;
        this.deletedRecordRepository = deletedRecordRepository;
    }

    public List<User> findAll() {
        return userRepository.findByDeletedFalseOrderByIdDesc();
    }

    public List<User> findTeachers() {
        return userRepository.findByRoleAndDeletedFalse(Role.TEACHER);
    }

    public User findById(@NonNull Long id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User save(User user) {
        String email = clean(user.getEmail());
        if (!userRepository.findByEmailIgnoreCaseAndDeletedFalseOrderByIdDesc(email).isEmpty()) {
            throw new IllegalArgumentException("Email already exists. Use another email.");
        }
        user.setEmail(email);
        if (user.getPassword() != null) {
            user.setPassword(user.getPassword().trim());
        }
        return userRepository.save(user);
    }

    public User update(@NonNull Long id, User request) {
        User user = findById(id);
        String email = clean(request.getEmail());
        boolean emailUsedByAnotherUser = userRepository.findByEmailIgnoreCaseAndDeletedFalseOrderByIdDesc(email)
                .stream()
                .anyMatch(item -> !item.getId().equals(id));
        if (emailUsedByAnotherUser) {
            throw new IllegalArgumentException("Email already exists. Use another email.");
        }
        user.setName(request.getName());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setStudentNumber(request.getStudentNumber());
        user.setBatchId(request.getBatchId());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(request.getPassword().trim());
        }
        return userRepository.save(user);
    }

    public void delete(@NonNull Long id) {
        User user = findById(id);
        user.setDeleted(true);
        userRepository.save(user);
        deletedRecordRepository.save(new DeletedRecord(null, "users", id, "system", user.getEmail()));
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
