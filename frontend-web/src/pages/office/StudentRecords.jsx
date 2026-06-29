import { useEffect, useState } from "react";
import FormOnlyLayout from "../dashboard/FormOnlyLayout.jsx";
import { deleteUser, getUsers, updateUser } from "../../services/userService.js";
import { getBatches } from "../../services/batchService.js";

export default function StudentRecords() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStudents = async () => {
    const response = await getUsers();
    setStudents(response.data.filter((user) => user.role === "STUDENT"));
  };

  useEffect(() => {
    loadStudents().catch(() => setError("Students could not be loaded."));
    getBatches().then((response) => setBatches(response.data)).catch(() => setError("Batches could not be loaded."));
  }, []);

  const batchName = (batchId) => {
    const batch = batches.find((item) => String(item.id) === String(batchId));
    return batch ? `${batch.name} - ${batch.courseName}` : "-";
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await updateUser(editing.id, editing);
      setMessage("Student saved successfully.");
      setEditing(null);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Student could not be saved.");
    }
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");

    try {
      await deleteUser(id);
      setMessage("Student deleted successfully.");
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Student could not be deleted.");
    }
  };

  return (
    <FormOnlyLayout title="Students List">
      {message && <p className="success-text dashboard-message">{message}</p>}
      {error && <p className="error-text dashboard-message">{error}</p>}

      {editing && (
        <form className="panel form-panel single-form edit-panel" onSubmit={handleUpdate}>
          <h2>Edit Student</h2>
          <input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
          <input placeholder="Student ID" value={editing.studentNumber || ""} onChange={(e) => setEditing({ ...editing, studentNumber: e.target.value })} />
          <input type="email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} required />
          <input value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
          <label className="form-field">
            <span>Batch</span>
            <select value={editing.batchId || ""} onChange={(e) => setEditing({ ...editing, batchId: Number(e.target.value) })} required>
              <option value="">Select batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>{batch.name} - {batch.courseName}</option>
              ))}
            </select>
          </label>
          <div className="button-row">
            <button className="btn btn-primary" type="submit">Save</button>
            <button className="btn btn-secondary" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Batch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan="6">No students found.</td></tr>}
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.studentNumber || "-"}</td>
                  <td>{student.email}</td>
                  <td>{student.phone || "-"}</td>
                  <td>{batchName(student.batchId)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary" type="button" onClick={() => setEditing(student)}>Edit</button>
                      <button className="btn btn-danger" type="button" onClick={() => handleDelete(student.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </FormOnlyLayout>
  );
}
