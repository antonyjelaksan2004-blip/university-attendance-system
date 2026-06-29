import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import DashboardStats from "../../components/DashboardStats.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DashboardLayout({ title, children, statsMode = "default", showStats = true }) {
  const { user } = useAuth();
  const roleLabel = (user?.role || "").replace("_", " ");

  return (
    <div>
      <Navbar />
      <div className="app-shell">
        <Sidebar />
        <main className="page">
          <div className="page-header">
            <div>
              <span className="user-name-line">{user?.name || title}</span>
              <h1>{roleLabel || title}</h1>
            </div>
          </div>
          {showStats && <DashboardStats mode={statsMode} user={user} />}
          {children}
        </main>
      </div>
    </div>
  );
}
