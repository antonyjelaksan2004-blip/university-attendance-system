package com.university.attendance.repository;

import com.university.attendance.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByDeletedFalseOrderByIdDesc();
}
