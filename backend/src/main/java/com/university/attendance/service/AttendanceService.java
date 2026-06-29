package com.university.attendance.service;

import com.university.attendance.model.AttendanceRecord;
import com.university.attendance.model.AttendanceStatus;
import com.university.attendance.repository.AttendanceRecordRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceService {
    private final AttendanceRecordRepository attendanceRecordRepository;

    public AttendanceService(AttendanceRecordRepository attendanceRecordRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    public List<AttendanceRecord> findAll() {
        return attendanceRecordRepository.findByReportSavedTrue();
    }

    public AttendanceRecord findById(@NonNull Long id) {
        return attendanceRecordRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
    }

    public AttendanceRecord save(AttendanceRecord request) {
        if (attendanceRecordRepository.findByStudentIdAndDateAndSessionIgnoreCase(request.getStudentId(), request.getDate(), request.getSession()).isPresent()) {
            throw new IllegalArgumentException("Attendance already marked for this student, date, and session");
        }
        return attendanceRecordRepository.save(request);
    }

    public AttendanceRecord update(@NonNull Long id, AttendanceRecord request) {
        AttendanceRecord record = findById(id);
        record.setStatus(request.getStatus());
        return attendanceRecordRepository.save(record);
    }

    public List<AttendanceRecord> findByBatch(Long batchId) {
        return attendanceRecordRepository.findByBatchIdAndReportSavedTrue(batchId);
    }

    public List<AttendanceRecord> findByStudent(Long studentId) {
        return attendanceRecordRepository.findByStudentIdAndReportSavedTrue(studentId);
    }

    public double percentageForStudent(Long studentId) {
        List<AttendanceRecord> records = findByStudent(studentId);
        if (records.isEmpty()) {
            return 0;
        }
        long present = records.stream().filter(item -> item.getStatus() == AttendanceStatus.PRESENT).count();
        return Math.round(((double) present / records.size()) * 10000.0) / 100.0;
    }
}
