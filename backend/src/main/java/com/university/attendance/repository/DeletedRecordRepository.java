package com.university.attendance.repository;

import com.university.attendance.model.DeletedRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeletedRecordRepository extends JpaRepository<DeletedRecord, Long> {
}
