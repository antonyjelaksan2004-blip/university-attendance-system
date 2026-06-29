import { useEffect, useState } from "react";
import SimpleDashboardLayout from "../dashboard/SimpleDashboardLayout.jsx";
import { createUser } from "../../services/userService.js";
import { getBatches } from "../../services/batchService.js";

const emptyForm = { name: "", email: "", phone: "", password: "", studentNumber: "", batch: "" };

export default function AddStudentAccount() {
  const [form, setForm] = useState(emptyForm);
  const [batches, setBatches] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    getBatches()
      .then((response) => {
        setBatches(response.data);
      })
      .catch(() => setError("Batches could not be loaded."));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        studentNumber: form.studentNumber,
        batchId: Number(form.batch),
        role: "STUDENT",
      });
      setMessage("Student account added successfully.");
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Student could not be added.");
    }
  };

  return (
    <SimpleDashboardLayout title="Add Student">
      <form className="panel form-panel single-form" onSubmit={handleSubmit}>
        <h2>Student Details</h2>
        <input placeholder="Student name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
        <input placeholder="Student ID" value={form.studentNumber} onChange={(e) => updateField("studentNumber", e.target.value)} required />
        <input placeholder="Student email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
        <input placeholder="Phone number" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required />
        <label className="form-field">
          <span>Batch</span>
          <select value={form.batch} onChange={(e) => updateField("batch", e.target.value)} required>
            <option value="">Select batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name} - {batch.courseName}
              </option>
            ))}
            {batches.length === 0 && <option value="" disabled>No batches available</option>}
          </select>
        </label>
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit">Add Student</button>
      </form>
    </SimpleDashboardLayout>
  );
}
