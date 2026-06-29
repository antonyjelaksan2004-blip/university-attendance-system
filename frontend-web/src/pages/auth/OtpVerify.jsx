import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { verifyOtp } from "../../services/authService.js";

export default function OtpVerify() {
  const navigate = useNavigate();
  const [email] = useState(sessionStorage.getItem("resetEmail") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyOtp({ email, otp });
      sessionStorage.setItem("verifiedOtp", otp);
      navigate("/reset-password");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page compact-auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>OTP Verification</h2>
        {!email && <p className="error-text">Please enter your email first.</p>}
        <Input label="Email" type="email" value={email} readOnly />
        <Input label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        {error && <p className="error-text">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Checking..." : "Verify OTP"}</Button>
      </form>
    </main>
  );
}
