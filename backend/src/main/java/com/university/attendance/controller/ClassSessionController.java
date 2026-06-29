package com.university.attendance.controller;

import com.university.attendance.dto.ClassSessionRequest;
import com.university.attendance.dto.MarkMyAttendanceRequest;
import com.university.attendance.model.AttendanceRecord;
import com.university.attendance.model.ClassSession;
import com.university.attendance.service.ClassSessionService;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/class-sessions")
public class ClassSessionController {
    private final ClassSessionService classSessionService;

    public ClassSessionController(ClassSessionService classSessionService) {
        this.classSessionService = classSessionService;
    }

    @PostMapping("/start")
    public ClassSession start(@RequestBody ClassSessionRequest request) {
        return classSessionService.start(request);
    }

    @GetMapping("/active")
    public Object active() {
        return classSessionService.active().<Object>map(session -> session).orElseGet(() -> Map.of("active", false));
    }

    @PostMapping("/{id}/submit")
    public ClassSession submit(@PathVariable @NonNull Long id) {
        return classSessionService.submit(id);
    }

    @GetMapping("/{id}/attendance")
    public java.util.List<AttendanceRecord> attendance(@PathVariable Long id) {
        return classSessionService.attendance(id);
    }

    @PostMapping("/mark-my-attendance")
    public AttendanceRecord markMyAttendance(@RequestBody MarkMyAttendanceRequest request) {
        return classSessionService.markMyAttendance(request);
    }
}
