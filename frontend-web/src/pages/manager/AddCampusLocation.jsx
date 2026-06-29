import { useEffect, useState } from "react";
import SimpleDashboardLayout from "../dashboard/SimpleDashboardLayout.jsx";
import {
  createCampus,
  deleteCampus,
  getCampuses,
  updateCampus,
} from "../../services/campusService.js";

const emptyForm = { name: "", latitude: "", longitude: "", radius: "100" };

export default function AddCampusLocation() {
  const [form, setForm] = useState(emptyForm);
  const [campuses, setCampuses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCampuses = async () => {
    try {
      const response = await getCampuses();
      setCampuses(response.data);
    } catch {
      setError("Location list could not be loaded.");
    }
  };

  useEffect(() => {
    loadCampuses();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const useCurrentLocation = () => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setError("Current location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        }));
        setMessage(`Current location captured with approximately ${Math.round(position.coords.accuracy || 0)}m GPS accuracy.`);
      },
      () => setError("Location permission denied or unavailable. Enable precise location and try again."),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      name: form.name,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radius: Number(form.radius),
      active: true,
    };

    try {
      if (editingId) {
        await updateCampus(editingId, payload);
        setMessage("Campus location updated successfully.");
      } else {
        await createCampus(payload);
        setMessage("Campus location added successfully.");
      }

      resetForm();
      await loadCampuses();
    } catch (err) {
      setError(err.response?.data?.message || "Campus location could not be saved.");
    }
  };

  const handleEdit = (campus) => {
    setEditingId(campus.id);
    setForm({
      name: campus.name,
      latitude: String(campus.latitude),
      longitude: String(campus.longitude),
      radius: String(campus.radius),
    });
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");

    try {
      await deleteCampus(id);
      setMessage("Campus location deleted successfully.");
      if (editingId === id) resetForm();
      await loadCampuses();
    } catch (err) {
      setError(err.response?.data?.message || "Campus location could not be deleted.");
    }
  };

  return (
    <SimpleDashboardLayout title="Add Campus Location">
      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Campus Location" : "Add Another Campus Location"}</h2>
          <p className="report-status">
            Add any number of locations. Attendance works inside the radius of any saved location.
          </p>

          <input
            placeholder="Campus name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />

          <button className="btn btn-secondary" type="button" onClick={useCurrentLocation}>
            Use My Current Location
          </button>

          <input
            placeholder="Latitude"
            value={form.latitude}
            onChange={(e) => updateField("latitude", e.target.value)}
            required
          />

          <input
            placeholder="Longitude"
            value={form.longitude}
            onChange={(e) => updateField("longitude", e.target.value)}
            required
          />

          <input
            placeholder="Radius meters"
            value={form.radius}
            onChange={(e) => updateField("radius", e.target.value)}
            required
          />

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <div className="button-row">
            <button className="btn btn-primary" type="submit">
              {editingId ? "Save Changes" : "Add Campus"}
            </button>

            {editingId && (
              <button className="btn btn-secondary" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <section className="panel wide">
          <div className="section-head">
            <h2>Location List</h2>
            <span className="report-status">{campuses.length} Locations</span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Campus</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Radius</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {campuses.length === 0 && (
                  <tr>
                    <td colSpan="5">No campus locations added.</td>
                  </tr>
                )}

                {campuses.map((campus) => (
                  <tr key={campus.id}>
                    <td>{campus.name}</td>
                    <td>{campus.latitude}</td>
                    <td>{campus.longitude}</td>
                    <td>{campus.radius}m</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" type="button" onClick={() => handleEdit(campus)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => handleDelete(campus.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </SimpleDashboardLayout>
  );
}
