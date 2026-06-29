import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import { forgotPassword } from "../../services/authService.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setOtp("");
    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      sessionStorage.setItem("resetEmail", response.data.email);
      if (response.data.otp) {
        setOtp(response.data.otp);
        sessionStorage.setItem("resetOtp", response.data.otp);
      }
      setMessage(response.data.message || "OTP sent to email.");
      navigate("/otp-verify");
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page compact-auth">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}
        {otp && (
          <div className="otp-box">
            <span>Testing OTP</span>
            <strong>{otp}</strong>
          </div>
        )}
        <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button>
      </form>
    </main>
  );
}
