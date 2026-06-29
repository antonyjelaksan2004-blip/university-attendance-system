import { useEffect, useMemo, useState } from "react";
import { Alert, BackHandler, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  Layers3,
} from "lucide-react-native";
import CustomButton from "../../components/CustomButton";
import { useAuth } from "../../context/AuthContext";
import { getAttendance, updateAttendance } from "../../services/attendanceService";
import { getBatches } from "../../services/batchService";
import {
  getActiveClassSession,
  getClassSessionAttendance,
  startClassSession,
  submitClassSession,
} from "../../services/classSessionService";
import { getUsers } from "../../services/userService";
import { colors } from "../../styles/colors";
import MobileShell, { ActionGrid, Card, DashboardHero, RowButton, ScreenTitle, StatGrid } from "../mobile/MobileShell";
import { ChoiceGroup, ReportsPanel, TimetableManager } from "../mobile/shared";

export default function TeacherDashboardScreen() {
  const { user } = useAuth();
  const [view, setView] = useState("home");
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [sessionName, setSessionName] = useState("Morning");
  const [classSession, setClassSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ students: 0, batches: 0, present: 0, absent: 0 });
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const availableBatches = useMemo(() => batches, [batches]);

  const loadHome = async () => {
    const [batchResponse, usersResponse, attendanceResponse, activeResponse] =
      await Promise.all([getBatches(), getUsers(), getAttendance(), getActiveClassSession()]);
    setBatches(batchResponse.data);
    const allBatchIds = new Set(batchResponse.data.map((item) => String(item.id)));
    const allStudents = usersResponse.data.filter((item) => item.role === "STUDENT" && allBatchIds.has(String(item.batchId)));
    const allRecords = attendanceResponse.data.filter((item) => allBatchIds.has(String(item.batchId)));
    setStats({
      students: allStudents.length,
      batches: batchResponse.data.length,
      present: allRecords.filter((item) => item.status === "PRESENT").length,
      absent: allRecords.filter((item) => item.status === "ABSENT").length,
    });
    if (activeResponse.data?.id && allBatchIds.has(String(activeResponse.data.batchId))) {
      setClassSession(activeResponse.data);
      setBatchId(String(activeResponse.data.batchId));
      setSessionName(activeResponse.data.sessionName || "Morning");
      setStudents((await getClassSessionAttendance(activeResponse.data.id)).data);
    }
  };

  useEffect(() => { loadHome().catch(() => {}); }, []);
  useEffect(() => {
    if (!classSession?.id) return undefined;
    const timer = setInterval(async () => {
      try {
        setStudents((await getClassSessionAttendance(classSession.id)).data);
      } catch {}
    }, 4000);
    return () => clearInterval(timer);
  }, [classSession?.id]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (view === "Attendance" && classSession?.id) {
        Alert.alert("Submit attendance first", "Complete and submit this attendance sheet before leaving.");
        return true;
      }
      if (view !== "home") {
        setView("home");
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [view, classSession?.id]);

  const present = students.filter((item) => item.status === "PRESENT").length;
  const absent = students.filter((item) => item.status === "ABSENT").length;

  const goBack = () => {
    if (classSession?.id && view === "Attendance") {
      Alert.alert("Submit attendance first", "Complete and submit this attendance sheet before leaving.");
      return;
    }
    setView("home");
  };

  const start = async () => {
    if (!batchId) return Alert.alert("Select batch", "Choose a batch first.");
    setFeedback("");
    setFeedbackError("");
    try {
      const response = await startClassSession({ batchId: Number(batchId), sessionName });
      setClassSession(response.data);
      setStudents((await getClassSessionAttendance(response.data.id)).data);
      setFeedback(`Class started for ${response.data.batchName}. Students can mark attendance now.`);
      Alert.alert("Class started", "Students in this batch have been notified.");
    } catch (error) {
      const message = error.response?.data?.message || "Class could not be started.";
      setFeedbackError(message);
      Alert.alert("Could not start", message);
    }
  };

  const setStatus = async (record, status) => {
    try {
      await updateAttendance(record.id, { status });
      setStudents((await getClassSessionAttendance(classSession.id)).data);
    } catch {
      Alert.alert("Update failed", "Attendance status could not be changed.");
    }
  };

  const finishSubmit = async () => {
    setFeedback("");
    setFeedbackError("");
    try {
      await submitClassSession(classSession.id);
      setClassSession(null);
      setStudents([]);
      setBatchId("");
      setView("home");
      await loadHome();
      setFeedback(`Attendance submitted successfully: ${present} present, ${absent} absent.`);
      Alert.alert("Saved", "Attendance submitted to reports.");
    } catch (error) {
      const message = error.response?.data?.message || "Attendance could not be submitted.";
      setFeedbackError(message);
      Alert.alert("Submit failed", message);
    }
  };

  const submit = () => {
    if (Platform.OS === "web") {
      finishSubmit();
      return;
    }
    Alert.alert(
      "Submit attendance",
      `Submit ${present} present and ${absent} absent records?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", onPress: finishSubmit },
      ]
    );
  };

  const rate = stats.present + stats.absent
    ? Math.round((stats.present / (stats.present + stats.absent)) * 100)
    : 0;

  return (
    <MobileShell title={view === "home" ? "Teacher" : view} onBack={view !== "home" ? goBack : undefined} onRefresh={view === "home" ? loadHome : undefined}>
      {view === "home" ? (
        <>
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          {feedbackError ? <Text style={styles.feedbackError}>{feedbackError}</Text> : null}
          <DashboardHero eyebrow="Teacher Workspace" title="My Classes" subtitle="Start attendance, notify students, monitor live marks and review your schedule." />
          <StatGrid stats={[
            { label: "Students", value: stats.students },
            { label: "Batches", value: stats.batches },
            { label: "Present", value: stats.present },
            { label: "Attendance", value: `${rate}%` },
          ]} />
          <ActionGrid>
            <RowButton accent="#2563EB" icon={ClipboardCheck} title="Attendance" text="Start and manage a live class" onPress={() => setView("Attendance")} />
            <RowButton accent="#6366F1" icon={Layers3} title="Batches" text="Review assigned classes" onPress={() => setView("Batches")} />
            <RowButton accent="#0891B2" icon={CalendarDays} title="Timetable" text="View your class schedule" onPress={() => setView("Timetable")} />
            <RowButton accent="#16A34A" icon={FileBarChart} title="History" text="Submitted attendance reports" onPress={() => setView("Reports")} />
          </ActionGrid>
        </>
      ) : null}

      {view === "Attendance" ? (
        <>
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          {feedbackError ? <Text style={styles.feedbackError}>{feedbackError}</Text> : null}
          <Card>
            <ScreenTitle title={classSession ? "Class In Progress" : "Start Class"} subtitle={classSession ? "Live student marks refresh automatically." : "All students begin as absent until they mark or you update them."} />
            <ChoiceGroup label="Batch" value={batchId} onChange={(value) => setBatchId(String(value))} options={availableBatches.map((batch) => ({ label: `${batch.name} - ${batch.courseName}`, value: batch.id }))} />
            <ChoiceGroup label="Session" value={sessionName} onChange={setSessionName} options={["Morning", "Afternoon", "Evening"].map((item) => ({ label: item, value: item }))} />
            {!classSession ? <CustomButton title="Start Class and Notify Students" onPress={start} /> : null}
          </Card>
          {classSession ? (
            <Card>
              <ScreenTitle title="Attendance Sheet" subtitle={`${classSession.batchName} · ${classSession.sessionName}`} />
              <StatGrid stats={[
                { label: "Total", value: students.length },
                { label: "Present", value: present },
                { label: "Absent", value: absent },
                { label: "Live Sync", value: "ON" },
              ]} />
              {students.map((record) => (
                <View style={styles.record} key={record.id}>
                  <View style={styles.studentCopy}>
                    <Text style={styles.student}>{record.studentName}</Text>
                    <Text style={[styles.status, record.status === "PRESENT" ? styles.presentStatus : styles.absentStatus]}>{record.status}</Text>
                  </View>
                  <View style={styles.manual}>
                    <Pressable accessibilityLabel="Mark present" style={[styles.statusButton, styles.presentButton]} onPress={() => setStatus(record, "PRESENT")}><Text style={styles.buttonText}>Present</Text></Pressable>
                    <Pressable accessibilityLabel="Mark absent" style={[styles.statusButton, styles.absentButton]} onPress={() => setStatus(record, "ABSENT")}><Text style={styles.buttonText}>Absent</Text></Pressable>
                  </View>
                </View>
              ))}
              <CustomButton title="Submit Attendance" onPress={submit} style={styles.submit} />
            </Card>
          ) : null}
        </>
      ) : null}

      {view === "Batches" ? (
        <Card>
          <ScreenTitle title="All Batches" subtitle={`${availableBatches.length} batches available`} />
          {availableBatches.map((batch) => (
            <View style={styles.batchRow} key={batch.id}>
              <CheckCircle2 color={colors.primary} size={20} />
              <View><Text style={styles.student}>{batch.name}</Text><Text style={styles.sub}>{batch.courseName}</Text></View>
            </View>
          ))}
        </Card>
      ) : null}
      {view === "Timetable" ? <TimetableManager readOnly teacherFilter={user.id} /> : null}
      {view === "Reports" ? <ReportsPanel /> : null}
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  record: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: colors.border, borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "space-between", marginBottom: 9, padding: 12 },
  studentCopy: { flex: 1 },
  student: { color: colors.text, fontSize: 15, fontWeight: "900" },
  sub: { color: colors.muted, marginTop: 3 },
  status: { fontSize: 11, fontWeight: "900", marginTop: 4 },
  presentStatus: { color: colors.green },
  absentStatus: { color: colors.red },
  manual: { flexDirection: "row", gap: 5 },
  statusButton: { borderRadius: 11, paddingHorizontal: 10, paddingVertical: 9 },
  presentButton: { backgroundColor: colors.green },
  absentButton: { backgroundColor: colors.red },
  buttonText: { color: colors.white, fontSize: 11, fontWeight: "900" },
  submit: { marginTop: 16 },
  feedback: { backgroundColor: "#DCFCE7", borderColor: "#86EFAC", borderRadius: 12, borderWidth: 1, color: colors.green, fontSize: 13, fontWeight: "900", marginBottom: 13, padding: 12 },
  feedbackError: { backgroundColor: "#FFF1F2", borderColor: "#FECDD3", borderRadius: 12, borderWidth: 1, color: colors.red, fontSize: 13, fontWeight: "900", marginBottom: 13, padding: 12 },
  batchRow: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: colors.border, borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 11, marginBottom: 9, padding: 13 },
});
