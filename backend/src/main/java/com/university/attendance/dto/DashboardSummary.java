package com.university.attendance.dto;

public class DashboardSummary {
    private long totalStudents;
    private long totalTeachers;
    private long totalBatches;
    private long totalAttendance;
    private double attendancePercentage;

    public DashboardSummary(long totalStudents, long totalTeachers, long totalBatches, long totalAttendance, double attendancePercentage) {
        this.totalStudents = totalStudents;
        this.totalTeachers = totalTeachers;
        this.totalBatches = totalBatches;
        this.totalAttendance = totalAttendance;
        this.attendancePercentage = attendancePercentage;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public long getTotalTeachers() {
        return totalTeachers;
    }

    public long getTotalBatches() {
        return totalBatches;
    }

    public long getTotalAttendance() {
        return totalAttendance;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }
}
