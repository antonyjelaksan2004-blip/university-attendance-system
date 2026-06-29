import { useState } from "react";
import SimpleDashboardLayout from "../dashboard/SimpleDashboardLayout.jsx";
import { createUser } from "../../services/userService.js";

const emptyForm = { name: "", email: "", phone: "", password: "" };

export default function AddTeacher() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createUser({ ...form, role: "TEACHER" });
      setMessage("Teacher added successfully.");
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Teacher could not be added.");
    }
  };

  return (
    <SimpleDashboardLayout title="Add Teacher">
      <form className="panel form-panel single-form" onSubmit={handleSubmit}>
        <h2>Teacher Details</h2>
        <input placeholder="Teacher name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
        <input placeholder="Teacher email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
        <input placeholder="Phone number" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit">Add Teacher</button>
      </form>
    </SimpleDashboardLayout>
  );
}
