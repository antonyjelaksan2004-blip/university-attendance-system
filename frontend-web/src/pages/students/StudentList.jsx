import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../dashboard/DashboardLayout.jsx";
import Table from "../../components/Table.jsx";
import { createUser, deleteUser, getUsers } from "../../services/userService.js";
import { getBatches } from "../../services/batchService.js";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  studentNumber: "",
  password: "",
  batchId: "",
};

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [usersResponse, batchesResponse] = await Promise.all([
        getUsers(),
        getBatches(),
      ]);

      setStudents(usersResponse.data.filter((user) => user.role === "STUDENT"));
      setBatches(batchesResponse.data);
    } catch {
      setError("Students could not be loaded.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const batchById = useMemo(
    () => new Map(batches.map((batch) => [String(batch.id), batch])),
    [batches]
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        studentNumber: form.studentNumber,
        password: form.password,
        batchId: form.batchId ? Number(form.batchId) : null,
        role: "STUDENT",
      });

      setForm(emptyForm);
      setMessage("Student added successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Student could not be added.");
    }
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");

    try {
      await deleteUser(id);
      setMessage("Student deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Student could not be deleted.");
    }
  };

  const rows = students.map((student) => {
    const batch = batchById.get(String(student.batchId));

    return {
      id: student.id,
      "Student ID": student.studentNumber || "-",
      Name: student.name,
      Email: student.email,
      Batch: batch ? batch.name : "-",
      Phone: student.phone || "-",
      Action: (
        <button className="btn btn-danger" type="button" onClick={() => handleDelete(student.id)}>
          Delete
        </button>
      ),
    };
  });

  return (
    <DashboardLayout title="Students">
      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>Add Student</h2>

          <input
            placeholder="Full name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />

          <input
            placeholder="Student ID"
            value={form.studentNumber}
            onChange={(event) => updateField("studentNumber", event.target.value)}
            required
          />

          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />

          <input
            placeholder="Phone number"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />

          <select
            value={form.batchId}
            onChange={(event) => updateField("batchId", event.target.value)}
            required
          >
            <option value="">Select batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name} - {batch.courseName}
              </option>
            ))}
          </select>

          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            required
          />

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit">
            Save Student
          </button>
        </form>

        <section className="panel wide">
          <div className="section-head">
            <h2>Student Directory</h2>
            <span className="report-status">{students.length} Students</span>
          </div>

          <Table
            columns={["Student ID", "Name", "Email", "Batch", "Phone", "Action"]}
            rows={rows}
          />
        </section>
      </section>
    </DashboardLayout>
  );
}