package com.university.attendance.repository;

import com.university.attendance.model.Role;
import com.university.attendance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByDeletedFalseOrderByIdDesc();
    List<User> findByRoleAndDeletedFalse(Role role);
    List<User> findByRoleAndBatchIdAndDeletedFalse(Role role, Long batchId);
    List<User> findByEmailIgnoreCaseAndDeletedFalseOrderByIdDesc(String email);
    Optional<User> findByEmailIgnoreCaseAndDeletedFalse(String email);
}
