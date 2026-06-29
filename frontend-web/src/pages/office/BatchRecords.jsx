import { useEffect, useState } from "react";
import FormOnlyLayout from "../dashboard/FormOnlyLayout.jsx";
import { getBatches, updateBatch } from "../../services/batchService.js";

export default function BatchRecords() {
  const [batches, setBatches] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadBatches = async () => {
    const response = await getBatches();
    setBatches(response.data);
  };

  useEffect(() => {
    loadBatches().catch(() => setError("Batches could not be loaded."));
  }, []);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await updateBatch(editing.id, {
        ...editing,
        assignedTeacherName: editing.assignedTeacherName || "",
        assignedTeacherId: null,
      });
      setMessage("Batch saved successfully.");
      setEditing(null);
      loadBatches();
    } catch (err) {
      setError(err.response?.data?.message || "Batch could not be saved.");
    }
  };

  return (
    <FormOnlyLayout title="Batch List">
      {message && <p className="success-text dashboard-message">{message}</p>}
      {error && <p className="error-text dashboard-message">{error}</p>}

      {editing && (
        <form className="panel form-panel single-form edit-panel" onSubmit={handleUpdate}>
          <h2>Edit Batch</h2>
          <input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
          <input value={editing.courseName || ""} onChange={(e) => setEditing({ ...editing, courseName: e.target.value })} required />
          <input
            placeholder="Teacher name"
            value={editing.assignedTeacherName || ""}
            onChange={(e) => setEditing({ ...editing, assignedTeacherName: e.target.value })}
          />
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
                <th>Batch Number</th>
                <th>Course Name</th>
                <th>Teacher Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 && <tr><td colSpan="4">No batches found.</td></tr>}
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td>{batch.name}</td>
                  <td>{batch.courseName}</td>
                  <td>{batch.assignedTeacherName || "-"}</td>
                  <td>
                    <button className="btn btn-secondary" type="button" onClick={() => setEditing(batch)}>Edit</button>
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
