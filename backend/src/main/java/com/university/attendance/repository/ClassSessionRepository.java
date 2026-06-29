package com.university.attendance.repository;

import com.university.attendance.model.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    Optional<ClassSession> findFirstByActiveTrueAndSubmittedFalseOrderByStartedAtDesc();
}
