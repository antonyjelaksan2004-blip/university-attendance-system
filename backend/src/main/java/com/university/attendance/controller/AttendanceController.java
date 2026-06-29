package com.university.attendance.controller;

import com.university.attendance.model.AttendanceRecord;
import com.university.attendance.service.AttendanceService;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<AttendanceRecord> all() {
        return attendanceService.findAll();
    }

    @GetMapping("/{id}")
    public AttendanceRecord one(@PathVariable @NonNull Long id) {
        return attendanceService.findById(id);
    }

    @PostMapping
    public AttendanceRecord create(@RequestBody AttendanceRecord attendanceRecord) {
        return attendanceService.save(attendanceRecord);
    }

    @PutMapping("/{id}")
    public AttendanceRecord update(@PathVariable @NonNull Long id, @RequestBody AttendanceRecord attendanceRecord) {
        return attendanceService.update(id, attendanceRecord);
    }

    @GetMapping("/by-batch/{batchId}")
    public List<AttendanceRecord> byBatch(@PathVariable Long batchId) {
        return attendanceService.findByBatch(batchId);
    }

    @GetMapping("/by-student/{studentId}")
    public List<AttendanceRecord> byStudent(@PathVariable Long studentId) {
        return attendanceService.findByStudent(studentId);
    }

    @GetMapping("/percentage")
    public Map<String, Double> percentage(@RequestParam Long studentId) {
        return Map.of("percentage", attendanceService.percentageForStudent(studentId));
    }
}
