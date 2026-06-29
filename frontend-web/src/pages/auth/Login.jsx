import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { loginUser } from "../../services/authService.js";

const dashboardByRole = {
  SUPER_ADMIN: "super-admin",
  MANAGER: "manager",
  OFFICE_STAFF: "office-staff",
  TEACHER: "teacher",
  STUDENT: "student",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      const data = response.data;
      const dashboardRole = dashboardByRole[data.role];

      if (!dashboardRole) {
        setError("This user role does not have a dashboard.");
        return;
      }

      login({
        access: data.token,
        user: {
          id: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
          studentNumber: data.studentNumber,
          batchId: data.batchId,
        },
      });
      navigate(`/dashboard/${dashboardRole}`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <span className="eyebrow">University Attendance</span>
        <h1>Attendance Management System</h1>
        <div className="hero-metrics">
          <div><strong>Secure</strong><span>Login</span></div>
          <div><strong>Live</strong><span>Attendance</span></div>
          <div><strong>PDF</strong><span>Reports</span></div>
        </div>
      </section>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign in</h2>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error-text">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
        <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
      </form>
    </main>
  );
}
