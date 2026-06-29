import { Link } from "react-router-dom";
import SimpleDashboardLayout from "./SimpleDashboardLayout.jsx";

export default function TeacherDashboard() {
  return (
    <SimpleDashboardLayout title="Teacher" showStats>
      <section className="action-grid teacher-action-grid">
        <Link className="action-card blue" to="/teacher/take-attendance">
          <span>Take Attendance</span>
          <p>Start class attendance.</p>
          <strong>Open</strong>
        </Link>
      </section>
    </SimpleDashboardLayout>
  );
}
