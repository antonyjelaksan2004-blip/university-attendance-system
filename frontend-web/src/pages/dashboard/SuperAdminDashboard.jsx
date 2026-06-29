import { useEffect, useState } from "react";
import { createUser, deleteUser, getUsers } from "../../services/userService.js";
import DashboardLayout from "./DashboardLayout.jsx";

export default function SuperAdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  const loadManagers = async () => {
    try {
      const response = await getUsers();
      setManagers(response.data.filter((user) => user.role === "MANAGER"));
    } catch (err) {
      setError("Manager list could not be loaded.");
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleAddManager = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await createUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "MANAGER",
      });
      setMessage("Manager added successfully.");
      setForm({ name: "", email: "", phone: "", password: "" });
      await loadManagers();
    } catch (err) {
      setError(err.response?.data?.message || "Manager could not be added.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async (id) => {
    setMessage("");
    setError("");

    try {
      await deleteUser(id);
      setMessage("Manager deleted successfully.");
      await loadManagers();
    } catch (err) {
      setError(err.response?.data?.message || "Manager could not be deleted.");
    }
  };

  return (
    <DashboardLayout title="Super Admin">
      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleAddManager}>
          <h2>Add Manager</h2>
          <input
            placeholder="Manager name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
          <input
            placeholder="Manager email"
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
          <input
            placeholder="Temporary password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            required
          />
          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Manager"}
          </button>
        </form>
        <section className="panel wide">
          <div className="section-head">
            <h2>Manager List</h2>
            <span className="report-status">{managers.length} Managers</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {managers.length === 0 && (
                  <tr>
                    <td colSpan="4">No managers added.</td>
                  </tr>
                )}
                {managers.map((manager) => (
                  <tr key={manager.id}>
                    <td>{manager.name}</td>
                    <td>{manager.email}</td>
                    <td>{manager.phone || "-"}</td>
                    <td>
                      <button className="btn btn-danger" type="button" onClick={() => handleDeleteManager(manager.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}
