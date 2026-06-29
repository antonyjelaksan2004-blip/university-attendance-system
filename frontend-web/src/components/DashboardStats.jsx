import { useEffect, useState } from "react";
import { getAttendanceReports } from "../services/attendanceService.js";
import { getBatches } from "../services/batchService.js";
import { getUsers } from "../services/userService.js";

export default function DashboardStats({ mode = "default", user }) {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    batches: 0,
    attendance: 0,
    present: 0,
    absent: 0,
  });

  const [studentBatchName, setStudentBatchName] = useState("-");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersResponse, batchesResponse, attendanceResponse] = await Promise.all([
          getUsers(),
          getBatches(),
          getAttendanceReports(),
        ]);

        const users = usersResponse.data;
        const batches = batchesResponse.data;
        const attendance = attendanceResponse.data;

        const present = attendance.filter((record) => record.status === "PRESENT").length;
        const absent = attendance.filter((record) => record.status === "ABSENT").length;
        const attendancePercent = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

        const batch = batches.find((item) => String(item.id) === String(user?.batchId));
        setStudentBatchName(batch ? batch.name : "-");

        setStats({
          students: users.filter((item) => item.role === "STUDENT").length,
          teachers: users.filter((item) => item.role === "TEACHER").length,
          batches: batches.length,
          attendance: attendancePercent,
          present,
          absent,
        });
      } catch (err) {
        setStats((current) => current);
      }
    };

    loadStats();
  }, [user?.batchId]);

  if (mode === "student") {
    return (
      <section className="stats-grid student-stats">
        <div className="stat">
          <span>Name</span>
          <strong>{user?.name || "Student"}</strong>
          <small>Student account</small>
        </div>

        <div className="stat">
          <span>Student ID</span>
          <strong>{user?.studentNumber || "-"}</strong>
          <small>Registered student number</small>
        </div>

        <div className="stat">
          <span>Batch Number</span>
          <strong>{studentBatchName}</strong>
          <small>Assigned batch</small>
        </div>

        <div className="stat">
          <span>Attendance</span>
          <strong>{stats.attendance}%</strong>
          <small>Submitted records</small>
        </div>
      </section>
    );
  }

  return (
    <section className="stats-grid">
      <div className="stat">
        <span>Total Students</span>
        <strong>{stats.students}</strong>
        <small>Active student accounts</small>
      </div>

      <div className="stat">
        <span>Total Teachers</span>
        <strong>{stats.teachers}</strong>
        <small>Active teacher accounts</small>
      </div>

      <div className="stat">
        <span>Total Batches</span>
        <strong>{stats.batches}</strong>
        <small>Created batches</small>
      </div>

      <div className="stat">
        <span>Attendance</span>
        <strong>{stats.attendance}%</strong>
        <small>{stats.present} present / {stats.absent} absent</small>
      </div>
    </section>
  );
}