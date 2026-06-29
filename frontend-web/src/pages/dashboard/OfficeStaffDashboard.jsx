import { Link } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";

const actions = [
  {
    title: "Add Student",
    text: "Create student account.",
    path: "/office/add-student",
    tone: "gold",
  },
  {
    title: "Add Batch",
    text: "Create batch record.",
    path: "/office/add-batch",
    tone: "slate",
  },
  {
    title: "Batch List",
    text: "View and edit batches.",
    path: "/office/batches",
    tone: "red",
  },
  {
    title: "Students List",
    text: "View and manage students.",
    path: "/office/students",
    tone: "blue",
  },
  {
    title: "Teacher List",
    text: "View teacher details.",
    path: "/office/teachers",
    tone: "purple",
  },
  {
    title: "Reports",
    text: "PDF and submissions.",
    path: "/office/reports",
    tone: "green",
  },
];

export default function OfficeStaffDashboard() {
  return (
    <DashboardLayout title="Office Staff">
      <section className="action-grid">
        {actions.map((action) => (
          <Link className={`action-card ${action.tone}`} to={action.path} key={action.title}>
            <span>{action.title}</span>
            <p>{action.text}</p>
            <strong>Open</strong>
          </Link>
        ))}
      </section>
    </DashboardLayout>
  );
}
