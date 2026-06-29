import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linksByRole = {
  SUPER_ADMIN: [
    ["/dashboard/super-admin", "Home"],
  ],
  MANAGER: [
    ["/dashboard/manager", "Home"],
    ["/students", "Students"],
    ["/batches", "Batches"],
    ["/manager/add-batch", "Add Batch"],
    ["/attendance/reports", "Reports"],
  ],
  OFFICE_STAFF: [
    ["/dashboard/office-staff", "Home"],
    ["/office/add-student", "Add Student"],
    ["/office/add-batch", "Add Batch"],
    ["/office/batches", "Batch List"],
    ["/office/students", "Students List"],
    ["/office/teachers", "Teacher List"],
    ["/office/reports", "Reports"],
  ],
  TEACHER: [
    ["/dashboard/teacher", "Home"],
    ["/teacher/take-attendance", "Take Attendance"],
  ],
  STUDENT: [
    ["/dashboard/student", "Home"],
    ["/student/class-attendance", "My Attendance"],
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || linksByRole.MANAGER;

  return (
    <aside className="sidebar">
      {links.map(([to, label]) => (
        <NavLink key={to} to={to}>{label}</NavLink>
      ))}
    </aside>
  );
}
