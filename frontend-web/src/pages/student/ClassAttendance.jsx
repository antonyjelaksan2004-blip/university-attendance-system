import { useEffect, useState } from "react";
import SimpleDashboardLayout from "../dashboard/SimpleDashboardLayout.jsx";
import { getActiveClassSession, markMyAttendance as markMyAttendanceApi } from "../../services/classSessionService.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClassAttendance() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("NOT_MARKED");
  const [classSession, setClassSession] = useState(null);

  useEffect(() => {
    getActiveClassSession()
      .then((response) => {
        if (response.data?.id && String(response.data.batchId) === String(user?.batchId)) {
          setClassSession(response.data);
        }
      })
      .catch(() => setError("Class status could not be loaded."));
  }, [user?.batchId]);

  const markMyAttendance = () => {
    setMessage("");
    setError("");

    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const studentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        try {
          await markMyAttendanceApi({
            userId: user.id,
            classSessionId: classSession.id,
            latitude: studentLocation.latitude,
            longitude: studentLocation.longitude,
            accuracy: position.coords.accuracy || 0,
          });
          setStatus("PRESENT");
          setMessage("Attendance marked as present.");
        } catch (err) {
          setStatus("ABSENT");
          setError(err.response?.data?.message || "Attendance not marked. You must be inside the assigned campus location.");
        }
      },
      () => setError("Location permission denied or unavailable.")
    );
  };

  return (
    <SimpleDashboardLayout title="Class Attendance">
      {!classSession ? (
        <section className="panel student-class-card">
          <span className="class-badge closed">No Class</span>
          <h2>No active class</h2>
          <p>Attendance opens only after your teacher starts the class.</p>
          {error && <p className="error-text">{error}</p>}
        </section>
      ) : (
        <section className="panel student-class-card">
          <span className="class-badge">Class Started</span>
          <h2>{classSession.batchName}</h2>
          <p>Mark attendance only when you are inside the allowed 100m campus/class radius.</p>
          {status === "NOT_MARKED" && <button className="btn btn-primary" type="button" onClick={markMyAttendance}>Mark My Attendance</button>}
          <div className="student-status">
            <span>Status</span>
            <strong className={`status-pill ${status.toLowerCase()}`}>{status.replace("_", " ")}</strong>
          </div>
          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
        </section>
      )}
    </SimpleDashboardLayout>
  );
}
