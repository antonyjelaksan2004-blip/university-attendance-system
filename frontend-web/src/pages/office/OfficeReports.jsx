import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormOnlyLayout from "../dashboard/FormOnlyLayout.jsx";
import Table from "../../components/Table.jsx";
import { getAttendanceReports } from "../../services/attendanceService.js";
import { getBatches } from "../../services/batchService.js";
import { getUsers } from "../../services/userService.js";
import { downloadAttendancePdf } from "../../utils/reportPdf.js";

export default function OfficeReports() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ date: "", batchId: "" });
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
      setError("Report data could not be loaded.");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const batchById = useMemo(() => new Map(batches.map((batch) => [String(batch.id), batch])), [batches]);
  const studentById = useMemo(() => new Map(users.filter((user) => user.role === "STUDENT").map((user) => [String(user.id), user])), [users]);

  const rows = records
    .filter((record) => {
      if (filters.date && record.date !== filters.date) return false;
      if (filters.batchId && String(record.batchId) !== String(filters.batchId)) return false;
      return true;
    })
    .map((record) => {
      const student = studentById.get(String(record.studentId));
      return {
        id: record.id,
        Date: record.date,
        Student: record.studentName || student?.name || `Student ${record.studentId}`,
        "Student ID": student?.studentNumber || "-",
        Batch: batchById.get(String(record.batchId))?.name || `Batch ${record.batchId}`,
        Status: record.status,
      };
    });

  const presentCount = rows.filter((row) => row.Status === "PRESENT").length;
  const absentCount = rows.filter((row) => row.Status === "ABSENT").length;
  const selectedBatchName = filters.batchId ? batchById.get(String(filters.batchId))?.name || "Selected batch" : "All batches";

  const downloadPdf = () => {
    downloadAttendancePdf({
      title: "Office Attendance Report",
      subtitle: `${selectedBatchName} student attendance records`,
      summary: [
        { label: "Batch", value: selectedBatchName },
        { label: "Total Records", value: rows.length },
        { label: "Present", value: presentCount },
        { label: "Absent", value: absentCount },
      ],
      columns: ["Date", "Student", "Student ID", "Batch", "Status"],
      rows,
    });
  };

  return (
    <FormOnlyLayout title="Office Reports">
      {error && <p className="error-text dashboard-message">{error}</p>}
      <section className="panel">
        <div className="section-head">
          <h2>Prepare Report</h2>
          <div className="table-actions">
            <button className="btn btn-secondary" type="button" onClick={() => navigate("/dashboard/office-staff")}>Cancel</button>
            <button className="btn btn-secondary" type="button" onClick={downloadPdf}>Download PDF</button>
          </div>
        </div>
        <div className="report-form">
          <label>
            <span>Report Type</span>
            <select>
              <option>Student List Report</option>
              <option>Batch Student Report</option>
              <option>Attendance Summary Report</option>
              <option>Monthly Office Report</option>
            </select>
          </label>
          <label>
            <span>Date</span>
            <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} />
          </label>
          <label>
            <span>Batch</span>
            <select value={filters.batchId} onChange={(event) => setFilters((current) => ({ ...current, batchId: event.target.value }))}>
              <option value="">All batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary report-submit" type="button" onClick={loadReports}>Generate Report</button>
        </div>
      </section>

      <section className="panel report-panel">
        <div className="section-head">
          <h2>Report Preview</h2>
          <span className="report-status">{presentCount} Present / {absentCount} Absent</span>
        </div>
        <div className="report-metrics">
          <div><span>Batch</span><strong>{selectedBatchName}</strong></div>
          <div><span>Total Records</span><strong>{rows.length}</strong></div>
          <div><span>Present</span><strong>{presentCount}</strong></div>
          <div><span>Absent</span><strong>{absentCount}</strong></div>
        </div>
        <Table columns={["Date", "Student", "Student ID", "Batch", "Status"]} rows={rows} />
      </section>
    </FormOnlyLayout>
  );
}
