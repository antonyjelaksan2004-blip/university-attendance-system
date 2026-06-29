import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../dashboard/DashboardLayout.jsx";
import Table from "../../components/Table.jsx";
import { createBatch, deleteBatch, getBatches } from "../../services/batchService.js";
import { getUsers } from "../../services/userService.js";

const emptyForm = {
  name: "",
  courseName: "",
  assignedTeacherName: "",
};

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [batchesResponse, usersResponse] = await Promise.all([
        getBatches(),
        getUsers(),
      ]);

      setBatches(batchesResponse.data);
      setTeachers(usersResponse.data.filter((user) => user.role === "TEACHER"));
      setStudents(usersResponse.data.filter((user) => user.role === "STUDENT"));
    } catch {
      setError("Batches could not be loaded.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentCountByBatch = useMemo(() => {
    const countMap = new Map();

    students.forEach((student) => {
      if (!student.batchId) return;
      const key = String(student.batchId);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    return countMap;
  }, [students]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createBatch({
        name: form.name,
        courseName: form.courseName,
        assignedTeacherName: form.assignedTeacherName,
        active: true,
      });

      setForm(emptyForm);
      setMessage("Batch created successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Batch could not be created.");
    }
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");

    try {
      await deleteBatch(id);
      setMessage("Batch deleted successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Batch could not be deleted.");
    }
  };

  const rows = batches.map((batch) => ({
    id: batch.id,
    "Batch Number": batch.name,
    Course: batch.courseName,
    Teacher: batch.assignedTeacherName || "-",
    Students: studentCountByBatch.get(String(batch.id)) || 0,
    Status: batch.active ? "Active" : "Inactive",
    Action: (
      <button className="btn btn-danger" type="button" onClick={() => handleDelete(batch.id)}>
        Delete
      </button>
    ),
  }));

  return (
    <DashboardLayout title="Batches">
      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>Create Batch</h2>

          <input
            placeholder="Batch number"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />

          <input
            placeholder="Course name"
            value={form.courseName}
            onChange={(event) => updateField("courseName", event.target.value)}
            required
          />

          <select
            value={form.assignedTeacherName}
            onChange={(event) => updateField("assignedTeacherName", event.target.value)}
          >
            <option value="">Assign teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.name}>
                {teacher.name}
              </option>
            ))}
          </select>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit">
            Create Batch
          </button>
        </form>

        <section className="panel wide">
          <div className="section-head">
            <h2>Batch List</h2>
            <span className="report-status">{batches.length} Batches</span>
          </div>

          <Table
            columns={["Batch Number", "Course", "Teacher", "Students", "Status", "Action"]}
            rows={rows}
          />
        </section>
      </section>
    </DashboardLayout>
  );
}