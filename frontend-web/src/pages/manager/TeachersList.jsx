import { useEffect, useState } from "react";
import FormOnlyLayout from "../dashboard/FormOnlyLayout.jsx";
import { deleteUser, getUsers, updateUser } from "../../services/userService.js";

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTeachers = async () => {
    const response = await getUsers();
    setTeachers(response.data.filter((user) => user.role === "TEACHER"));
  };

  useEffect(() => {
    loadTeachers().catch(() => setError("Teachers could not be loaded."));
  }, []);

  const handleDelete = async (id) => {
    setMessage("");
    setError("");

    try {
      await deleteUser(id);
      setMessage("Teacher deleted successfully.");
      loadTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Teacher could not be deleted.");
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await updateUser(editing.id, editing);
      setMessage("Teacher saved successfully.");
      setEditing(null);
      loadTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Teacher could not be saved.");
    }
  };

  return (
    <FormOnlyLayout title="Teachers List">
      {message && <p className="success-text dashboard-message">{message}</p>}
      {error && <p className="error-text dashboard-message">{error}</p>}

      {editing && (
        <form className="panel form-panel single-form edit-panel" onSubmit={handleUpdate}>
          <h2>Edit Teacher</h2>
          <input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
          <input type="email" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} required />
          <input value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
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
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 && (
                <tr><td colSpan="4">No teachers found.</td></tr>
              )}
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone || "-"}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary" type="button" onClick={() => setEditing(teacher)}>Edit</button>
                      <button className="btn btn-danger" type="button" onClick={() => handleDelete(teacher.id)}>Delete</button>
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
