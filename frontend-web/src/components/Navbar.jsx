import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { logout, user } = useAuth();
  const roleLabel = (user?.role || "").replace("_", " ");

  return (
    <header className="navbar">
      <div className="brand-block">
        <img className="brand-logo" src="/app-icon.png" alt="University Attendance" />
        <strong>University Attendance</strong>
      </div>
      <div className="navbar-actions">
        {user && (
          <div className="nav-user">
            <span>{user.name}</span>
            <strong>{roleLabel}</strong>
          </div>
        )}
        <button className="link-button" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
