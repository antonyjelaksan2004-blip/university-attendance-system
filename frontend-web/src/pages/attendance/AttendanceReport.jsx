import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout.jsx";
import Table from "../../components/Table.jsx";
import { getAttendanceReports } from "../../services/attendanceService.js";
import { getBatches } from "../../services/batchService.js";
import { getUsers } from "../../services/userService.js";
import { downloadAttendancePdf } from "../../utils/reportPdf.js";

export default function AttendanceReport() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ date: "", month: "", batchId: "", student: "", teacher: "" });
  const [error, setError] = useState("");

  const loadReports = async () => {
    setError("");
    try {
      const [attendanceResponse, batchResponse, userResponse] = await Promise.all([
        getAttendanceReports(),
        getBatches(),
        getUsers(),
      ]);
      setRecords(attendanceResponse.data);
      setBatches(batchResponse.data);
      setUsers(userResponse.data);
    } catch (err) {
      setError("Attendance reports could not be loaded.");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const batchById = useMemo(() => new Map(batches.map((batch) => [String(batch.id), batch])), [batches]);
  const userById = useMemo(() => new Map(users.map((user) => [String(user.id), user])), [users]);

  const reportRows = records
    .filter((record) => {
      const student = userById.get(String(record.studentId));
      const teacher = userById.get(String(record.teacherId));
      const studentText = `${record.studentName || ""} ${student?.email || ""} ${student?.studentNumber || ""}`.toLowerCase();
      const teacherText = `${teacher?.name || ""} ${teacher?.email || ""}`.toLowerCase();

      if (filters.date && record.date !== filters.date) return false;
      if (filters.month && !record.date?.startsWith(filters.month)) return false;
      if (filters.batchId && String(record.batchId) !== String(filters.batchId)) return false;
      if (filters.student && !studentText.includes(filters.student.toLowerCase())) return false;
      if (filters.teacher && !teacherText.includes(filters.teacher.toLowerCase())) return false;
      return true;
    })
    .map((record) => ({
      id: record.id,
      Date: record.date,
      Student: record.studentName || userById.get(String(record.studentId))?.name || `Student ${record.studentId}`,
      Batch: batchById.get(String(record.batchId))?.name || `Batch ${record.batchId}`,
      Session: record.session,
      Status: record.status,
    }));

  const presentCount = reportRows.filter((row) => row.Status === "PRESENT").length;
  const absentCount = reportRows.filter((row) => row.Status === "ABSENT").length;
  const percentage = reportRows.length === 0 ? 0 : Math.round((presentCount / reportRows.length) * 100);
  const selectedBatchName = filters.batchId ? batchById.get(String(filters.batchId))?.name || "Selected batch" : "All batches";

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const downloadPdf = () => {
    downloadAttendancePdf({
      title: "Attendance Report",
      subtitle: `${selectedBatchName} attendance summary`,
      summary: [
        { label: "Batch", value: selectedBatchName },
        { label: "Total Students", value: new Set(reportRows.map((row) => row.Student)).size },
        { label: "Present", value: presentCount },
        { label: "Absent", value: absentCount },
        { label: "Attendance", value: `${percentage}%` },
      ],
      columns: ["Date", "Student", "Batch", "Session", "Status"],
      rows: reportRows,
    });
  };

  return (
    <DashboardLayout title="Attendance Reports">
      {error && <p className="error-text dashboard-message">{error}</p>}
      <section className="panel">
        <div className="section-head">
          <h2>Report Filters</h2>
          <div className="table-actions">
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/dashboard/manager")}>Cancel</button>
            <button className="btn btn-secondary" type="button" onClick={downloadPdf}>Download PDF</button>
          </div>
        </div>
        <div className="report-form">
          <label>
            <span>Report Type</span>
            <select>
              <option>Daily Attendance Report</option>
              <option>Monthly Attendance Report</option>
              <option>Batch-wise Report</option>
              <option>Student-wise Report</option>
              <option>Teacher-wise Report</option>
              <option>Attendance Percentage Report</option>
            </select>
          </label>
          <label>
            <span>Date</span>
            <input type="date" value={filters.date} onChange={(event) => updateFilter("date", event.target.value)} />
          </label>
          <label>
            <span>Month</span>
            <input type="month" value={filters.month} onChange={(event) => updateFilter("month", event.target.value)} />
          </label>
          <label>
            <span>Batch</span>
            <select value={filters.batchId} onChange={(event) => updateFilter("batchId", event.target.value)}>
              <option value="">All batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Student</span>
            <input placeholder="Name or ID" value={filters.student} onChange={(event) => updateFilter("student", event.target.value)} />
          </label>
          <label>
            <span>Teacher</span>
            <input placeholder="Name or ID" value={filters.teacher} onChange={(event) => updateFilter("teacher", event.target.value)} />
          </label>
          <button className="btn btn-primary report-submit" type="button" onClick={loadReports}>Refresh Report</button>
        </div>
      </section>

      <section className="panel report-panel">
        <div className="section-head">
          <h2>Attendance Summary</h2>
          <span className="report-status">{presentCount} Present / {absentCount} Absent / {percentage}%</span>
        </div>
        <div className="report-metrics">
          <div><span>Batch</span><strong>{selectedBatchName}</strong></div>
          <div><span>Total Records</span><strong>{reportRows.length}</strong></div>
          <div><span>Present</span><strong>{presentCount}</strong></div>
          <div><span>Absent</span><strong>{absentCount}</strong></div>
        </div>
        <Table columns={["Date", "Student", "Batch", "Session", "Status"]} rows={reportRows} />
      </section>
    </DashboardLayout>
  );
}
