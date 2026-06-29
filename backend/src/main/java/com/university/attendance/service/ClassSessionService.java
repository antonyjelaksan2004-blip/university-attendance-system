package com.university.attendance.service;

import com.university.attendance.dto.ClassSessionRequest;
import com.university.attendance.dto.MarkMyAttendanceRequest;
import com.university.attendance.model.AttendanceRecord;
import com.university.attendance.model.AttendanceStatus;
import com.university.attendance.model.Batch;
import com.university.attendance.model.CampusLocation;
import com.university.attendance.model.ClassSession;
import com.university.attendance.model.Role;
import com.university.attendance.model.User;
import com.university.attendance.repository.AttendanceRecordRepository;
import com.university.attendance.repository.BatchRepository;
import com.university.attendance.repository.CampusLocationRepository;
import com.university.attendance.repository.ClassSessionRepository;
import com.university.attendance.repository.UserRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ClassSessionService {
    private final ClassSessionRepository classSessionRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final CampusLocationRepository campusLocationRepository;
    private final PushNotificationService pushNotificationService;

    public ClassSessionService(
            ClassSessionRepository classSessionRepository,
            BatchRepository batchRepository,
            UserRepository userRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            CampusLocationRepository campusLocationRepository,
            PushNotificationService pushNotificationService
    ) {
        this.classSessionRepository = classSessionRepository;
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.campusLocationRepository = campusLocationRepository;
        this.pushNotificationService = pushNotificationService;
    }

    public ClassSession start(ClassSessionRequest request) {
        @SuppressWarnings("null")
        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new IllegalArgumentException("Batch not found"));

        classSessionRepository.findFirstByActiveTrueAndSubmittedFalseOrderByStartedAtDesc()
                .ifPresent(session -> {
                    session.setActive(false);
                    session.setSubmitted(true);
                    session.setSubmittedAt(LocalDateTime.now());
                    classSessionRepository.save(session);
                });

        ClassSession classSession = new ClassSession();
        classSession.setBatchId(batch.getId());
        classSession.setBatchName(batch.getName());
        classSession.setSessionName(request.getSessionName());
        classSession.setActive(true);
        classSession.setSubmitted(false);
        classSession.setStartedAt(LocalDateTime.now());
        ClassSession savedSession = classSessionRepository.save(classSession);
        createDefaultAbsentRecords(savedSession);
        pushNotificationService.notifyBatchStudents(
                batch.getId(),
                batch.getName(),
                request.getSessionName()
        );
        return savedSession;
    }

    public Optional<ClassSession> active() {
        return classSessionRepository.findFirstByActiveTrueAndSubmittedFalseOrderByStartedAtDesc();
    }

    public ClassSession submit(@NonNull Long id) {
        ClassSession classSession = classSessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));
        classSession.setActive(false);
        classSession.setSubmitted(true);
        classSession.setSubmittedAt(LocalDateTime.now());
        List<AttendanceRecord> records = attendanceRecordRepository.findByClassSessionId(classSession.getId());
        for (AttendanceRecord record : records) {
            record.setReportSaved(true);
            attendanceRecordRepository.save(record);
        }
        return classSessionRepository.save(classSession);
    }

    public List<AttendanceRecord> attendance(Long classSessionId) {
        return attendanceRecordRepository.findByClassSessionId(classSessionId);
    }

    @SuppressWarnings("null")
    public AttendanceRecord markMyAttendance(MarkMyAttendanceRequest request) {
        @SuppressWarnings("null")
        ClassSession classSession = classSessionRepository.findById(request.getClassSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));

        if (!classSession.isActive() || classSession.isSubmitted()) {
            throw new IllegalArgumentException("Attendance is already submitted");
        }

        User student = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        if (student.getBatchId() == null || !student.getBatchId().equals(classSession.getBatchId())) {
            throw new IllegalArgumentException("This class is not assigned to your batch");
        }

        List<CampusLocation> campuses = campusLocationRepository.findAll();
        if (campuses.isEmpty()) {
            throw new IllegalArgumentException("Campus location is not configured");
        }

        double accuracy = request.getAccuracy();
        double accuracyTolerance = Math.min(Math.max(accuracy, 0), 50);
        boolean insideSavedLocation = campuses.stream().anyMatch(campus -> {
            double distance = distanceInMeters(
                    campus.getLatitude(),
                    campus.getLongitude(),
                    request.getLatitude(),
                    request.getLongitude()
            );
            // Laptop browsers often report a very large accuracy radius. A
            // weak signal is still safe when its reported point is already
            // inside the configured campus boundary. Accuracy tolerance is
            // only added for reasonably precise phone readings.
            if (distance <= campus.getRadius()) {
                return true;
            }
            return accuracy <= 100
                    && distance <= campus.getRadius() + accuracyTolerance;
        });

        if (!insideSavedLocation) {
            if (accuracy > 100) {
                throw new IllegalArgumentException(
                        "Your GPS is not precise enough and the reported location is outside the saved campus radius. "
                                + "Move near a window, enable precise location, or save this device location as a campus location"
                );
            }
            throw new IllegalArgumentException(
                    "You are outside all saved campus attendance areas. Move inside a saved location radius and try again"
            );
        }

        AttendanceRecord record = attendanceRecordRepository
                .findByClassSessionIdAndStudentId(classSession.getId(), student.getId())
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
        record.setStatus(AttendanceStatus.PRESENT);
        return attendanceRecordRepository.save(record);
    }

    private void createDefaultAbsentRecords(ClassSession classSession) {
        List<User> students = userRepository.findByRoleAndBatchIdAndDeletedFalse(Role.STUDENT, classSession.getBatchId());
        for (User student : students) {
            AttendanceRecord record = new AttendanceRecord();
            record.setClassSessionId(classSession.getId());
            record.setBatchId(classSession.getBatchId());
            record.setStudentId(student.getId());
            record.setStudentName(student.getName());
            record.setDate(LocalDate.now());
            record.setSession(classSession.getSessionName());
            record.setStatus(AttendanceStatus.ABSENT);
            record.setReportSaved(false);
            record.setCreatedAt(LocalDateTime.now());
            attendanceRecordRepository.save(record);
        }
    }

    private double distanceInMeters(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
