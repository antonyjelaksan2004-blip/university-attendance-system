import { Link } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";

const actions = [
  {
    title: "Add Teacher",
    text: "Create teacher account.",
    path: "/manager/add-teacher",
    tone: "blue",
  },
  {
    title: "Teachers List",
    text: "View and manage teachers.",
    path: "/manager/teachers",
    tone: "purple",
  },
  {
    title: "Add Office Staff",
    text: "Create staff account.",
    path: "/manager/add-office-staff",
    tone: "green",
  },
  {
    title: "Office Staff List",
    text: "View and manage staff.",
    path: "/manager/office-staff",
    tone: "slate",
  },
  {
    title: "Add Student",
    text: "Create student account.",
    path: "/manager/add-student",
    tone: "gold",
  },
  {
    title: "Add Batch",
    text: "Create batch record.",
    path: "/manager/add-batch",
    tone: "slate",
  },
  {
    title: "Add Campus Location",
    text: "Save campus radius.",
    path: "/manager/add-campus",
    tone: "red",
  },
  {
    title: "Reports",
    text: "View attendance and download PDF.",
    path: "/attendance/reports",
    tone: "green",
  },
];

export default function ManagerDashboard() {
  return (
    <DashboardLayout title="Manager">
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
