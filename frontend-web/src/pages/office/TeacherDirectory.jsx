import { useEffect, useState } from "react";
import FormOnlyLayout from "../dashboard/FormOnlyLayout.jsx";
import { getUsers } from "../../services/userService.js";

export default function TeacherDirectory() {
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers()
      .then((response) => {
        setTeachers(response.data.filter((user) => user.role === "TEACHER"));
      })
      .catch(() => setError("Teachers could not be loaded."));
  }, []);

  return (
    <FormOnlyLayout title="Teacher List">
      {error && <p className="error-text dashboard-message">{error}</p>}
      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 && <tr><td colSpan="3">No teachers found.</td></tr>}
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </FormOnlyLayout>
  );
}
