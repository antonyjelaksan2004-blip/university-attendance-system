import DashboardLayout from "../dashboard/DashboardLayout.jsx";

export default function MarkAttendance() {
  const students = [];

  return (
    <DashboardLayout title="Mark Attendance">
      <section className="panel">
        <div className="toolbar">
          <select><option>Select batch</option></select>
          <input type="date" defaultValue="2026-06-18" />
          <select><option>Morning Session</option><option>Evening Session</option></select>
        </div>
        <div className="attendance-list">
          {students.length === 0 && <div className="empty-state">Students will appear after selecting a batch.</div>}
          {students.map((student) => (
            <div className="attendance-row" key={student}>
              <strong>{student}</strong>
              <div>
                <button className="btn btn-success">Present</button>
                <button className="btn btn-danger">Absent</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
