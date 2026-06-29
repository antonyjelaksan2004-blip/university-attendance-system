import { useState } from "react";
import SimpleDashboardLayout from "../dashboard/SimpleDashboardLayout.jsx";
import { createBatch } from "../../services/batchService.js";

const emptyForm = {
  batchNumber: "",
  courseName: "",
  assignedTeacherName: "",
};

export default function AddBatchByManager() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createBatch({
        name: form.batchNumber,
        courseName: form.courseName,
        assignedTeacherName: form.assignedTeacherName,
        assignedTeacherId: null,
        active: true,
      });
      setMessage("Batch added successfully.");
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Batch could not be added.");
    }
  };

  return (
    <SimpleDashboardLayout title="Add Batch">
      <form className="panel form-panel single-form" onSubmit={handleSubmit}>
        <h2>Batch Details</h2>
        <input placeholder="Batch number" value={form.batchNumber} onChange={(e) => updateField("batchNumber", e.target.value)} required />
        <input placeholder="Course name" value={form.courseName} onChange={(e) => updateField("courseName", e.target.value)} required />
        <input placeholder="Teacher name" value={form.assignedTeacherName} onChange={(e) => updateField("assignedTeacherName", e.target.value)} />
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit">Add Batch</button>
      </form>
    </SimpleDashboardLayout>
  );
}
