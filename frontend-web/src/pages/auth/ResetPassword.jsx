import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { resetPassword } from "../../services/authService.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email] = useState(sessionStorage.getItem("resetEmail") || "");
  const [otp] = useState(sessionStorage.getItem("verifiedOtp") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetOtp");
      sessionStorage.removeItem("verifiedOtp");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page compact-auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        {!email || !otp ? <p className="error-text">Please verify OTP first.</p> : null}
        <Input label="New Password" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <Input label="Re-enter Password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <label className="check-row">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          <span>Show password</span>
        </label>
        {error && <p className="error-text">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Password"}</Button>
      </form>
    </main>
  );
}
