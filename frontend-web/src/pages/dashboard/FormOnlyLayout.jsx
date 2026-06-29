import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FormOnlyLayout({ title, children }) {
  const { user } = useAuth();
  const roleLabel = (user?.role || "").replace("_", " ");

  return (
    <div>
      <Navbar />
      <div className="app-shell">
        <Sidebar />
        <main className="page">
          <div className="page-header simple-page-header">
            <div>
              <span className="user-name-line">{user?.name || title}</span>
              <h1>{roleLabel || title}</h1>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
