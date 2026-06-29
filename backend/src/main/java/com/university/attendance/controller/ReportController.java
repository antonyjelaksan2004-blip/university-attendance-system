package com.university.attendance.controller;

import com.university.attendance.dto.DashboardSummary;
import com.university.attendance.model.DeletedRecord;
import com.university.attendance.repository.DeletedRecordRepository;
import com.university.attendance.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;
    private final DeletedRecordRepository deletedRecordRepository;

    public ReportController(ReportService reportService, DeletedRecordRepository deletedRecordRepository) {
        this.reportService = reportService;
        this.deletedRecordRepository = deletedRecordRepository;
    }

    @GetMapping("/dashboard")
    public DashboardSummary dashboard() {
        return reportService.dashboardSummary();
    }

    @GetMapping("/deleted-records")
    public List<DeletedRecord> deletedRecords() {
        return deletedRecordRepository.findAll();
    }
}
