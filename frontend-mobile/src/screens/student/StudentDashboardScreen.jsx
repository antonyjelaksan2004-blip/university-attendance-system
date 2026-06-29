import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import {
  CalendarDays,
  ClipboardCheck,
  FileBarChart,
  Layers3,
  UserRound,
} from "lucide-react-native";
import CustomButton from "../../components/CustomButton";
import { useAuth } from "../../context/AuthContext";
import { getAttendance } from "../../services/attendanceService";
import { getBatches } from "../../services/batchService";
import {
  getActiveClassSession,
  getClassSessionAttendance,
  markMyAttendance,
} from "../../services/classSessionService";
import { colors } from "../../styles/colors";
import { getReliableLocation } from "../../utils/location";
import MobileShell, { ActionGrid, Card, DashboardHero, RowButton, ScreenTitle, StatGrid } from "../mobile/MobileShell";
import { ReportsPanel, TimetableManager } from "../mobile/shared";

export default function StudentDashboardScreen({ notificationRefresh = 0 }) {
  const { user } = useAuth();
  const [view, setView] = useState("home");
  const [classSession, setClassSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [marking, setMarking] = useState(false);
  const [liveStatus, setLiveStatus] = useState("NOT_MARKED");
  const [markFeedback, setMarkFeedback] = useState("");
  const [markError, setMarkError] = useState("");

  const load = async () => {
    const [activeResponse, attendanceResponse, batchesResponse] =
      await Promise.all([getActiveClassSession(), getAttendance(), getBatches()]);
    setBatches(batchesResponse.data);
    setRecords(attendanceResponse.data.filter((item) => String(item.studentId) === String(user.id)));
    const activeSession =
      activeResponse.data?.id
      && String(activeResponse.data.batchId) === String(user.batchId)
        ? activeResponse.data
        : null;
    setClassSession(activeSession);

    if (activeSession?.id) {
      const sheetResponse = await getClassSessionAttendance(activeSession.id);
      const ownRecord = sheetResponse.data.find(
        (item) => String(item.studentId) === String(user.id)
      );
      setLiveStatus(ownRecord?.status || "NOT_MARKED");
    } else {
      setLiveStatus("NOT_MARKED");
    }
  };
  useEffect(() => { load().catch(() => {}); }, [notificationRefresh]);
  useEffect(() => {
    const timer = setInterval(() => load().catch(() => {}), 8000);
    return () => clearInterval(timer);
  }, [user.id, user.batchId]);

  const batch = useMemo(
    () => batches.find((item) => String(item.id) === String(user.batchId)),
    [batches, user.batchId]
  );
  const present = records.filter((item) => item.status === "PRESENT").length;
  const absent = records.filter((item) => item.status === "ABSENT").length;
  const percentage = records.length ? Math.round((present / records.length) * 100) : 0;

  const mark = async () => {
    if (!classSession?.id) return Alert.alert("No active class", "Your teacher has not started a class.");
    setMarking(true);
    setMarkFeedback("Reading your current location...");
    setMarkError("");
    try {
      const location = await getReliableLocation();
      setMarkFeedback("Location received. Saving attendance...");
      const response = await markMyAttendance({
        userId: user.id,
        classSessionId: classSession.id,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
      });
      if (response.data?.status !== "PRESENT") {
        throw new Error("Attendance was not confirmed by the server.");
      }

      const sheetResponse = await getClassSessionAttendance(classSession.id);
      const confirmedRecord = sheetResponse.data.find(
        (item) => String(item.studentId) === String(user.id)
      );
      if (confirmedRecord?.status !== "PRESENT") {
        throw new Error("Attendance save could not be verified. Please try again.");
      }

      setLiveStatus("PRESENT");
      await load();
      setMarkFeedback("Attendance marked and confirmed by the server.");
      Alert.alert("Attendance marked", "You are marked present for this class.");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "You must be inside the campus attendance area.";
      setMarkFeedback("");
      setMarkError(message);
      Alert.alert("Not marked", message);
    } finally {
      setMarking(false);
    }
  };

  return (
    <MobileShell title={view === "home" ? "Student" : view} onBack={view !== "home" ? () => setView("home") : undefined} onRefresh={view === "home" ? load : undefined}>
      {view === "home" ? (
        <>
          <DashboardHero eyebrow="Student Workspace" title="My Attendance" subtitle={classSession ? `${classSession.batchName} class is live now. Mark attendance from inside the campus area.` : "Your profile, batch, timetable and submitted attendance are available here."} />
          <StatGrid stats={[
            { label: "Student ID", value: user.studentNumber || "-" },
            { label: "Batch", value: batch?.name || "-" },
            { label: "Present", value: present },
            { label: "Attendance", value: `${percentage}%` },
          ]} />
          {classSession ? (
            <Card style={styles.liveCard}>
              <View style={styles.liveDotRow}><View style={styles.liveDot} /><Text style={styles.liveLabel}>CLASS STARTED</Text></View>
              <Text style={styles.liveTitle}>{classSession.batchName}</Text>
              <Text style={styles.liveText}>{classSession.sessionName} session is accepting attendance.</Text>
              <View style={[styles.liveStatus, liveStatus === "PRESENT" ? styles.livePresent : styles.livePending]}>
                <Text style={[styles.liveStatusText, liveStatus === "PRESENT" ? styles.livePresentText : styles.livePendingText]}>
                  {liveStatus === "PRESENT" ? "PRESENT - SERVER CONFIRMED" : "NOT MARKED"}
                </Text>
              </View>
              <CustomButton
                title={liveStatus === "PRESENT" ? "Attendance Confirmed" : "Mark My Attendance"}
                onPress={mark}
                loading={marking}
                disabled={liveStatus === "PRESENT"}
                style={styles.markButton}
              />
              {markFeedback ? <Text style={styles.markSuccess}>{markFeedback}</Text> : null}
              {markError ? <Text style={styles.markError}>{markError}</Text> : null}
            </Card>
          ) : null}
          <ActionGrid>
            <RowButton accent="#2563EB" icon={UserRound} title="Profile" text="Account and student details" onPress={() => setView("Profile")} />
            <RowButton accent="#6366F1" icon={Layers3} title="Batch" text="Course and assigned teacher" onPress={() => setView("Batch")} />
            <RowButton accent="#0891B2" icon={CalendarDays} title="Timetable" text="View upcoming classes" onPress={() => setView("Timetable")} />
            <RowButton accent="#16A34A" icon={FileBarChart} title="Records" text="Attendance history and rate" onPress={() => setView("Records")} />
          </ActionGrid>
        </>
      ) : null}

      {view === "Profile" ? (
        <Card>
          <ScreenTitle title="Student Profile" />
          {[["Name", user.name], ["Email", user.email], ["Student ID", user.studentNumber || "-"], ["Batch", batch?.name || "-"], ["Course", batch?.courseName || "-"]].map(([label, value]) => (
            <View style={styles.detail} key={label}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>
          ))}
        </Card>
      ) : null}
      {view === "Batch" ? (
        <Card>
          <ScreenTitle title="Batch Details" />
          <Text style={styles.batchName}>{batch?.name || "Not assigned"}</Text>
          <Text style={styles.course}>{batch?.courseName || "-"}</Text>
          <View style={styles.teacherBox}><Text style={styles.detailLabel}>Assigned Teacher</Text><Text style={styles.detailValue}>{batch?.assignedTeacherName || "Not assigned"}</Text></View>
        </Card>
      ) : null}
      {view === "Timetable" ? <TimetableManager readOnly batchFilter={user.batchId} /> : null}
      {view === "Records" ? <ReportsPanel studentId={user.id} /> : null}
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  liveCard: { backgroundColor: "#F0FDFA", borderColor: "#5EEAD4", borderWidth: 1 },
  liveDotRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  liveDot: { backgroundColor: colors.green, borderRadius: 5, height: 9, width: 9 },
  liveLabel: { color: colors.green, fontSize: 11, fontWeight: "900" },
  liveTitle: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 12 },
  liveText: { color: colors.muted, marginTop: 5 },
  liveStatus: { alignSelf: "flex-start", borderRadius: 10, marginTop: 13, paddingHorizontal: 10, paddingVertical: 7 },
  livePresent: { backgroundColor: "#DCFCE7" },
  livePending: { backgroundColor: "#FEF3C7" },
  liveStatusText: { fontSize: 11, fontWeight: "900" },
  livePresentText: { color: colors.green },
  livePendingText: { color: "#B45309" },
  markButton: { marginTop: 16 },
  markSuccess: { color: colors.green, fontSize: 12, fontWeight: "800", lineHeight: 18, marginTop: 11 },
  markError: { backgroundColor: "#FFF1F2", borderColor: "#FECDD3", borderRadius: 10, borderWidth: 1, color: colors.red, fontSize: 12, fontWeight: "800", lineHeight: 18, marginTop: 11, padding: 10 },
  detail: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 13 },
  detailLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  detailValue: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 5 },
  batchName: { color: colors.text, fontSize: 28, fontWeight: "900" },
  course: { color: colors.primary, fontSize: 16, fontWeight: "800", marginTop: 6 },
  teacherBox: { backgroundColor: colors.soft, borderColor: "#A5F3FC", borderRadius: 15, borderWidth: 1, marginTop: 18, padding: 15 },
});
