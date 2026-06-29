package com.university.attendance.repository;

import com.university.attendance.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByReportSavedTrue();
    List<AttendanceRecord> findByBatchIdAndReportSavedTrue(Long batchId);
    List<AttendanceRecord> findByStudentIdAndReportSavedTrue(Long studentId);
    List<AttendanceRecord> findByClassSessionId(Long classSessionId);
    Optional<AttendanceRecord> findByStudentIdAndDateAndSessionIgnoreCase(Long studentId, LocalDate date, String session);
    Optional<AttendanceRecord> findByClassSessionIdAndStudentId(Long classSessionId, Long studentId);
}
