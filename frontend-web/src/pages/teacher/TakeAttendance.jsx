import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleDashboardLayout from "../dashboard/SimpleDashboardLayout.jsx";
import { getBatches } from "../../services/batchService.js";
import { getCampuses } from "../../services/campusService.js";
import {
  getActiveClassSession,
  getClassSessionAttendance,
  startClassSession,
  submitClassSession,
} from "../../services/classSessionService.js";
import { updateAttendance } from "../../services/attendanceService.js";
import { distanceInMeters } from "../../utils/location.js";

export default function TakeAttendance() {
  const navigate = useNavigate();

  const [batch, setBatch] = useState("");
  const [sessionName, setSessionName] = useState("Morning");
  const [classStarted, setClassStarted] = useState(false);
  const [classSession, setClassSession] = useState(null);
  const [batches, setBatches] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const totalStudents = students.length;
  const presentCount = students.filter((student) => student.status === "PRESENT").length;
  const absentCount = students.filter((student) => student.status === "ABSENT").length;

  const resetAttendanceSheet = () => {
    setClassStarted(false);
    setClassSession(null);
    setStudents([]);
    setBatch("");
    setSessionName("Morning");
    setRefreshing(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [batchResponse, campusResponse, activeResponse] = await Promise.all([
          getBatches(),
          getCampuses(),
          getActiveClassSession(),
        ]);

        setBatches(batchResponse.data);
        setCampuses(campusResponse.data);

        if (activeResponse.data?.id) {
          setBatch(String(activeResponse.data.batchId));
          setSessionName(activeResponse.data.sessionName || "Morning");
          setClassSession(activeResponse.data);
          setClassStarted(true);
          await loadAttendance(activeResponse.data.id, true);
          setMessage("An active class was restored. Live attendance is syncing.");
        }
      } catch {
        setError("Attendance screen could not be loaded.");
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!classStarted || !classSession?.id) return undefined;

    const timer = window.setInterval(() => {
      syncActiveAttendance(true);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [classStarted, classSession?.id]);

  useEffect(() => {
    const preventCloseWithoutSubmit = (event) => {
      if (!classStarted) return;

      event.preventDefault();
      event.returnValue = "Submit attendance before leaving.";
    };

    window.addEventListener("beforeunload", preventCloseWithoutSubmit);

    return () => {
      window.removeEventListener("beforeunload", preventCloseWithoutSubmit);
    };
  }, [classStarted]);

  const mapAttendanceRecords = (records) =>
    records.map((record) => ({
      id: record.studentId,
      attendanceId: record.id,
      name: record.studentName,
      status: record.status,
      source: record.status === "PRESENT" ? "Student marked" : "Default absent",
    }));

  const loadAttendance = async (sessionId = classSession?.id, silent = false) => {
    if (!sessionId) return;

    if (!silent) setRefreshing(true);
    setError("");

    try {
      const attendanceResponse = await getClassSessionAttendance(sessionId);
      setStudents(mapAttendanceRecords(attendanceResponse.data));
    } catch (err) {
      setError(err.response?.data?.message || "Attendance list could not be refreshed.");
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  const syncActiveAttendance = async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError("");

    try {
      const activeResponse = await getActiveClassSession();
      const activeSession = activeResponse.data?.id ? activeResponse.data : null;

      if (!activeSession) {
        resetAttendanceSheet();
        setMessage("There is no active class. Start a new class attendance session.");
        return;
      }

      if (String(activeSession.id) !== String(classSession?.id)) {
        setClassSession(activeSession);
        setClassStarted(true);
        setBatch(String(activeSession.batchId));
        setSessionName(activeSession.sessionName || "Morning");
        setMessage(`Switched to the current active class: ${activeSession.batchName}.`);
      }

      const attendanceResponse = await getClassSessionAttendance(activeSession.id);
      setStudents(mapAttendanceRecords(attendanceResponse.data));
    } catch (err) {
      setError(err.response?.data?.message || "Live attendance could not be synchronized.");
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  const startAttendance = async () => {
    setError("");
    setMessage("");

    if (!batch) {
      setError("Please select a batch.");
      return;
    }

    if (!navigator.geolocation) {
      setError("Location is not supported on this device.");
      return;
    }

    try {
      if (!campuses.length) {
        setError("Campus location is not configured. Add campus location first.");
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
        });
      });

      const teacherLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const accuracyTolerance = Math.min(
        Math.max(Number(position.coords.accuracy || 0), 0),
        50
      );
      const matchingCampus = campuses.find((campus) => {
        const distance = distanceInMeters(campus, teacherLocation);
        const allowedRadius = Number(campus.radius || 100) + accuracyTolerance;
        return distance <= allowedRadius;
      });

      if (!matchingCampus) {
        setError("You are outside all saved campus locations. Go inside one saved location radius and start attendance.");
        return;
      }

      const response = await startClassSession({
        batchId: Number(batch),
        sessionName,
      });

      setClassSession(response.data);
      setClassStarted(true);
      await loadAttendance(response.data.id);
      setMessage(`Class started from ${matchingCampus.name}. Students can mark attendance now.`);
    } catch (err) {
      setError(err.response?.data?.message || "Location permission is required to start attendance.");
    }
  };

  const updateStatus = async (studentId, status) => {
    const selectedStudent = students.find((student) => student.id === studentId);

    if (selectedStudent?.attendanceId) {
      await updateAttendance(selectedStudent.attendanceId, { status });
      await loadAttendance();
    }
  };

  const submitAttendance = async () => {
    setError("");
    setMessage("");

    try {
      await submitClassSession(classSession.id);
      resetAttendanceSheet();
      setMessage("Attendance submitted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Attendance could not be submitted.");
    }
  };

  const blockLeaving = () => {
    if (!classStarted) return false;

    setError("Submit attendance before leaving this page.");
    setMessage("");
    return true;
  };

  const goBackToDashboard = () => {
    if (blockLeaving()) return;
    navigate("/dashboard/teacher");
  };

  return (
    <SimpleDashboardLayout title="Take Attendance">
      {message && <p className="success-text dashboard-message">{message}</p>}
      {error && <p className="error-text dashboard-message">{error}</p>}

      <section className="panel attendance-control">
        <div className="section-head">
          <h2>Start Class Attendance</h2>
          <button className="btn btn-secondary" type="button" onClick={goBackToDashboard}>
            Back
          </button>
        </div>

        <div className="report-form">
          <label>
            <span>Batch</span>
            <select
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              disabled={classStarted}
            >
              <option value="">Select batch</option>
              {batches.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.courseName}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Session</span>
            <select
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
              disabled={classStarted}
            >
              <option>Morning</option>
              <option>Evening</option>
            </select>
          </label>

          <button
            className="btn btn-primary report-submit"
            type="button"
            onClick={startAttendance}
            disabled={classStarted}
          >
            {classStarted ? "Attendance Started" : "Mark Attendance"}
          </button>
        </div>
      </section>

      {classStarted && (
        <section className="panel report-panel">
          <div className="section-head">
            <h2>Attendance Sheet</h2>

            <div className="table-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => syncActiveAttendance()}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button className="btn btn-primary" type="button" onClick={submitAttendance}>
                Submit Attendance
              </button>
            </div>
          </div>

          <p className="error-text">
            Attendance is not saved yet. Please submit attendance before leaving this page.
          </p>

          <div className="report-metrics attendance-metrics">
            <div>
              <span>Total Students</span>
              <strong>{totalStudents}</strong>
            </div>

            <div>
              <span>Present</span>
              <strong>{presentCount}</strong>
            </div>

            <div>
              <span>Absent</span>
              <strong>{absentCount}</strong>
            </div>

            <div>
              <span>Live Sync</span>
              <strong>{refreshing ? "..." : "On"}</strong>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Manual Action</th>
                </tr>
              </thead>

              <tbody>
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4">No students found for this batch.</td>
                  </tr>
                )}

                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>
                      <span className={`status-pill ${student.status.toLowerCase()}`}>
                        {student.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>{student.source}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-success"
                          type="button"
                          onClick={() => updateStatus(student.id, "PRESENT")}
                        >
                          Present
                        </button>

                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => updateStatus(student.id, "ABSENT")}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </SimpleDashboardLayout>
  );
}
