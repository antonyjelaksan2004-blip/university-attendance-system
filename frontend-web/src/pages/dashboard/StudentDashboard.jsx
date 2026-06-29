import DashboardLayout from "./DashboardLayout.jsx";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <DashboardLayout title="Student" statsMode="student">
      <section className="action-grid teacher-action-grid">
        <Link className="action-card green" to="/student/class-attendance">
          <span>Class Attendance</span>
          <p>Mark using location.</p>
          <strong>Open</strong>
        </Link>
      </section>
    </DashboardLayout>
  );
}
