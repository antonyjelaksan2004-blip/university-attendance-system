package com.university.attendance.service;

import com.university.attendance.dto.DashboardSummary;
import com.university.attendance.model.AttendanceStatus;
import com.university.attendance.model.Role;
import com.university.attendance.repository.AttendanceRecordRepository;
import com.university.attendance.repository.BatchRepository;
import com.university.attendance.repository.StudentRepository;
import com.university.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ReportService {
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public ReportService(StudentRepository studentRepository, UserRepository userRepository, BatchRepository batchRepository, AttendanceRecordRepository attendanceRecordRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    public DashboardSummary dashboardSummary() {
        long students = studentRepository.findByDeletedFalseOrderByIdDesc().size();
        long teachers = userRepository.findByRoleAndDeletedFalse(Role.TEACHER).size();
        long batches = batchRepository.findByDeletedFalseOrderByIdDesc().size();
        long totalAttendance = attendanceRecordRepository.count();
        long present = attendanceRecordRepository.findAll().stream().filter(item -> item.getStatus() == AttendanceStatus.PRESENT).count();
        double percentage = totalAttendance == 0 ? 0 : Math.round(((double) present / totalAttendance) * 10000.0) / 100.0;
        return new DashboardSummary(students, teachers, batches, totalAttendance, percentage);
    }
}
