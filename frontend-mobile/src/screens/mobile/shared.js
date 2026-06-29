import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { getAttendance } from "../../services/attendanceService";
import {
  createBatch,
  deleteBatch,
  getBatches,
  updateBatch,
} from "../../services/batchService";
import {
  createCampus,
  deleteCampus,
  getCampuses,
  updateCampus,
} from "../../services/campusService";
import { getDeletedRecords } from "../../services/reportService";
import {
  createTimetable,
  deleteTimetable,
  getTimetable,
  updateTimetable,
} from "../../services/timetableService";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../services/userService";
import { colors } from "../../styles/colors";
import { getReliableLocation } from "../../utils/location";
import {
  Card,
  EmptyState,
  ScreenTitle,
  SectionActions,
  StatGrid,
} from "./MobileShell";

const emptyUser = {
  name: "",
  email: "",
  phone: "",
  password: "",
  studentNumber: "",
  batchId: "",
};

const friendlyError = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceWrap}>
        {options.map((option) => {
          const selected = String(value) === String(option.value);
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              style={[styles.choice, selected && styles.choiceSelected]}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    managers: 0,
    staff: 0,
    batches: 0,
    present: 0,
    absent: 0,
    attendance: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [usersResponse, batchesResponse, attendanceResponse] =
        await Promise.all([getUsers(), getBatches(), getAttendance()]);
      const users = usersResponse.data;
      const records = attendanceResponse.data;
      const present = records.filter((item) => item.status === "PRESENT").length;
      const absent = records.filter((item) => item.status === "ABSENT").length;
      setStats({
        students: users.filter((item) => item.role === "STUDENT").length,
        teachers: users.filter((item) => item.role === "TEACHER").length,
        managers: users.filter((item) => item.role === "MANAGER").length,
        staff: users.filter((item) => item.role === "OFFICE_STAFF").length,
        batches: batchesResponse.data.length,
        present,
        absent,
        attendance: records.length
          ? Math.round((present / records.length) * 100)
          : 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats().catch(() => {});
  }, []);

  return { stats, loading, loadStats };
}

export function DashboardStats({ stats, mode = "default" }) {
  const items = mode === "admin"
    ? [
        { label: "Managers", value: stats.managers },
        { label: "Users", value: stats.students + stats.teachers + stats.staff + stats.managers },
        { label: "Students", value: stats.students },
        { label: "Batches", value: stats.batches },
      ]
    : [
        { label: "Students", value: stats.students },
        { label: "Teachers", value: stats.teachers },
        { label: "Batches", value: stats.batches },
        { label: "Attendance", value: `${stats.attendance}%` },
      ];
  return <StatGrid stats={items} />;
}

export function UserManager({
  title,
  role,
  includeStudent = false,
  readOnly = false,
  onChanged,
}) {
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [usersResponse, batchesResponse] = await Promise.all([
      getUsers(),
      getBatches(),
    ]);
    setUsers(usersResponse.data.filter((item) => item.role === role));
    setBatches(batchesResponse.data);
  };

  useEffect(() => {
    load().catch((error) => Alert.alert("Load failed", friendlyError(error, "Records could not be loaded.")));
  }, [role]);

  const reset = () => {
    setForm(emptyUser);
    setEditingId(null);
  };

  const save = async () => {
    if (!form.name.trim() || !form.email.trim() || (!editingId && !form.password)) {
      Alert.alert("Required fields", "Name, email and password are required.");
      return;
    }
    if (includeStudent && (!form.studentNumber.trim() || !form.batchId)) {
      Alert.alert("Student details", "Student ID and batch are required.");
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      email: form.email.trim(),
      batchId: includeStudent && form.batchId ? Number(form.batchId) : null,
      studentNumber: includeStudent ? form.studentNumber : null,
      role,
    };
    try {
      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }
      reset();
      await load();
      await onChanged?.();
      Alert.alert("Saved", `${title} saved successfully.`);
    } catch (error) {
      Alert.alert("Could not save", friendlyError(error, "Please check the details."));
    } finally {
      setLoading(false);
    }
  };

  const edit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      studentNumber: user.studentNumber || "",
      batchId: user.batchId ? String(user.batchId) : "",
    });
  };

  const remove = (user) => Alert.alert(
    "Delete record",
    `Delete ${user.name}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(user.id);
            await load();
            await onChanged?.();
          } catch (error) {
            Alert.alert("Delete failed", friendlyError(error, "Record could not be deleted."));
          }
        },
      },
    ]
  );

  const batchMap = useMemo(
    () => new Map(batches.map((item) => [String(item.id), item])),
    [batches]
  );
  const filtered = users.filter((user) =>
    `${user.name} ${user.email} ${user.studentNumber || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      {!readOnly ? (
        <Card>
          <ScreenTitle title={editingId ? `Edit ${title}` : `Add ${title}`} />
          <CustomInput label="Full name" value={form.name} onChangeText={(name) => setForm({ ...form, name })} placeholder="Full name" />
          {includeStudent ? <CustomInput label="Student ID" value={form.studentNumber} onChangeText={(studentNumber) => setForm({ ...form, studentNumber })} placeholder="Student number" /> : null}
          <CustomInput label="Email" value={form.email} onChangeText={(email) => setForm({ ...form, email })} keyboardType="email-address" placeholder="Email address" />
          <CustomInput label="Phone" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} keyboardType="phone-pad" placeholder="Phone number" />
          {includeStudent ? (
            <ChoiceGroup
              label="Select batch"
              value={form.batchId}
              onChange={(batchId) => setForm({ ...form, batchId: String(batchId) })}
              options={batches.map((batch) => ({ label: `${batch.name} · ${batch.courseName}`, value: batch.id }))}
            />
          ) : null}
          <CustomInput
            label={editingId ? "New password (optional)" : "Password"}
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
            secureTextEntry
            placeholder={editingId ? "Leave blank to keep current password" : "Temporary password"}
          />
          <View style={styles.actionRow}>
            <CustomButton title={editingId ? "Save Changes" : `Add ${title}`} onPress={save} loading={loading} style={styles.flexButton} />
            {editingId ? <CustomButton title="Cancel" variant="secondary" onPress={reset} style={styles.smallButton} /> : null}
          </View>
        </Card>
      ) : null}

      <Card>
        <ScreenTitle title={`${title} List`} subtitle={`${users.length} records`} action={<SectionActions onRefresh={load} />} />
        <CustomInput value={search} onChangeText={setSearch} placeholder="Search name, email or ID" />
        {filtered.map((user) => (
          <View style={styles.listRow} key={user.id}>
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{user.name}</Text>
              <Text style={styles.listSub}>{user.email}</Text>
              {includeStudent ? (
                <Text style={styles.meta}>
                  {user.studentNumber || "No ID"} · {batchMap.get(String(user.batchId))?.name || "No batch"}
                </Text>
              ) : null}
            </View>
            {!readOnly ? (
              <View style={styles.miniActions}>
                <Pressable style={styles.editButton} onPress={() => edit(user)}><Text style={styles.editText}>Edit</Text></Pressable>
                <Pressable style={styles.deleteButton} onPress={() => remove(user)}><Text style={styles.deleteText}>Delete</Text></Pressable>
              </View>
            ) : null}
          </View>
        ))}
        {!filtered.length ? <EmptyState /> : null}
      </Card>
    </>
  );
}

export function BatchManager({ readOnly = false, onChanged }) {
  const empty = { name: "", courseName: "", assignedTeacherName: "" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const load = async () => {
    const [batchResponse, userResponse] = await Promise.all([getBatches(), getUsers()]);
    setBatches(batchResponse.data);
    setTeachers(userResponse.data.filter((item) => item.role === "TEACHER"));
    setStudents(userResponse.data.filter((item) => item.role === "STUDENT"));
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const reset = () => { setForm(empty); setEditingId(null); };
  const save = async () => {
    if (!form.name.trim() || !form.courseName.trim()) {
      Alert.alert("Required fields", "Batch number and course name are required.");
      return;
    }
    try {
      const payload = { ...form, active: true };
      if (editingId) await updateBatch(editingId, payload);
      else await createBatch(payload);
      reset();
      await load();
      await onChanged?.();
      Alert.alert("Saved", "Batch saved successfully.");
    } catch (error) {
      Alert.alert("Could not save", friendlyError(error, "Batch could not be saved."));
    }
  };
  const remove = (batch) => Alert.alert("Delete batch", `Delete ${batch.name}?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { await deleteBatch(batch.id); await load(); await onChanged?.(); } },
  ]);
  const counts = useMemo(() => {
    const map = new Map();
    students.forEach((student) => map.set(String(student.batchId), (map.get(String(student.batchId)) || 0) + 1));
    return map;
  }, [students]);

  return (
    <>
      {!readOnly ? (
        <Card>
          <ScreenTitle title={editingId ? "Edit Batch" : "Create Batch"} />
          <CustomInput label="Batch number" value={form.name} onChangeText={(name) => setForm({ ...form, name })} placeholder="Example: BIT-01" />
          <CustomInput label="Course name" value={form.courseName} onChangeText={(courseName) => setForm({ ...form, courseName })} placeholder="Course name" />
          <ChoiceGroup
            label="Assign teacher"
            value={form.assignedTeacherName}
            onChange={(assignedTeacherName) => setForm({ ...form, assignedTeacherName })}
            options={[{ label: "Not assigned", value: "" }, ...teachers.map((teacher) => ({ label: teacher.name, value: teacher.name }))]}
          />
          <View style={styles.actionRow}>
            <CustomButton title={editingId ? "Save Changes" : "Create Batch"} onPress={save} style={styles.flexButton} />
            {editingId ? <CustomButton title="Cancel" variant="secondary" onPress={reset} style={styles.smallButton} /> : null}
          </View>
        </Card>
      ) : null}
      <Card>
        <ScreenTitle title="Batch List" subtitle={`${batches.length} batches`} action={<SectionActions onRefresh={load} />} />
        {batches.map((batch) => (
          <View style={styles.listRow} key={batch.id}>
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{batch.name}</Text>
              <Text style={styles.listSub}>{batch.courseName}</Text>
              <Text style={styles.meta}>{batch.assignedTeacherName || "No teacher"} · {counts.get(String(batch.id)) || 0} students</Text>
            </View>
            {!readOnly ? (
              <View style={styles.miniActions}>
                <Pressable style={styles.editButton} onPress={() => { setEditingId(batch.id); setForm({ name: batch.name, courseName: batch.courseName, assignedTeacherName: batch.assignedTeacherName || "" }); }}><Text style={styles.editText}>Edit</Text></Pressable>
                <Pressable style={styles.deleteButton} onPress={() => remove(batch)}><Text style={styles.deleteText}>Delete</Text></Pressable>
              </View>
            ) : null}
          </View>
        ))}
        {!batches.length ? <EmptyState text="No batches created." /> : null}
      </Card>
    </>
  );
}

export function CampusManager() {
  const empty = { name: "", latitude: "", longitude: "", radius: "100" };
  const [form, setForm] = useState(empty);
  const [campuses, setCampuses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const load = async () => setCampuses((await getCampuses()).data);
  useEffect(() => { load().catch(() => {}); }, []);
  const reset = () => { setForm(empty); setEditingId(null); };
  const currentLocation = async () => {
    try {
      const result = await getReliableLocation();
      setForm({
        ...form,
        latitude: result.coords.latitude.toFixed(7),
        longitude: result.coords.longitude.toFixed(7),
      });
      Alert.alert(
        "Location captured",
        `GPS accuracy is approximately ${Math.round(result.coords.accuracy || 0)} meters.`
      );
    } catch (error) {
      Alert.alert("Location unavailable", error.message);
    }
  };
  const save = async () => {
    if (!form.name || !form.latitude || !form.longitude || !form.radius) return Alert.alert("Required fields", "Complete all campus details.");
    const payload = { name: form.name, latitude: Number(form.latitude), longitude: Number(form.longitude), radius: Number(form.radius), active: true };
    try {
      if (editingId) await updateCampus(editingId, payload);
      else await createCampus(payload);
      reset();
      await load();
      Alert.alert("Saved", "Campus location saved.");
    } catch (error) {
      Alert.alert("Could not save", friendlyError(error, "Campus could not be saved."));
    }
  };

  return (
    <>
      <Card>
        <ScreenTitle
          title={editingId ? "Edit Campus" : "Add Campus Location"}
          subtitle="Add any number of locations. Attendance works inside any saved location radius."
        />
        <CustomInput label="Campus name" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
        <CustomInput label="Latitude" value={form.latitude} onChangeText={(latitude) => setForm({ ...form, latitude })} keyboardType="decimal-pad" />
        <CustomInput label="Longitude" value={form.longitude} onChangeText={(longitude) => setForm({ ...form, longitude })} keyboardType="decimal-pad" />
        <CustomInput label="Radius in meters" value={form.radius} onChangeText={(radius) => setForm({ ...form, radius })} keyboardType="number-pad" />
        <CustomButton title="Use My Current Location" variant="secondary" onPress={currentLocation} />
        <CustomButton title={editingId ? "Save Changes" : "Save Campus"} onPress={save} style={styles.topGap} />
        {editingId ? <CustomButton title="Cancel Edit" variant="secondary" onPress={reset} style={styles.topGap} /> : null}
      </Card>
      <Card>
        <ScreenTitle title="Location List" subtitle={`${campuses.length} locations`} action={<SectionActions onRefresh={load} />} />
        {campuses.map((campus) => (
          <View style={styles.listRow} key={campus.id}>
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{campus.name}</Text>
              <Text style={styles.listSub}>{campus.latitude}, {campus.longitude}</Text>
              <Text style={styles.meta}>{campus.radius} meter radius</Text>
            </View>
            <View style={styles.miniActions}>
              <Pressable style={styles.editButton} onPress={() => { setEditingId(campus.id); setForm({ name: campus.name, latitude: String(campus.latitude), longitude: String(campus.longitude), radius: String(campus.radius) }); }}><Text style={styles.editText}>Edit</Text></Pressable>
              <Pressable style={styles.deleteButton} onPress={() => Alert.alert("Delete location", `Delete ${campus.name}?`, [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await deleteCampus(campus.id); await load(); } }])}><Text style={styles.deleteText}>Delete</Text></Pressable>
            </View>
          </View>
        ))}
        {!campuses.length ? <EmptyState text="No campus locations." /> : null}
      </Card>
    </>
  );
}

export function TimetableManager({ readOnly = false, batchFilter, teacherFilter }) {
  const empty = { batchId: "", subject: "", teacherId: "", date: "", startTime: "", endTime: "" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const load = async () => {
    const [timetableResponse, batchesResponse, usersResponse] = await Promise.all([getTimetable(), getBatches(), getUsers()]);
    setItems(timetableResponse.data);
    setBatches(batchesResponse.data);
    setTeachers(usersResponse.data.filter((item) => item.role === "TEACHER"));
  };
  useEffect(() => { load().catch(() => {}); }, []);
  const batchMap = useMemo(() => new Map(batches.map((item) => [String(item.id), item])), [batches]);
  const teacherMap = useMemo(() => new Map(teachers.map((item) => [String(item.id), item])), [teachers]);
  const visible = items.filter((item) => (!batchFilter || String(item.batchId) === String(batchFilter)) && (!teacherFilter || String(item.teacherId) === String(teacherFilter)));
  const reset = () => { setForm(empty); setEditingId(null); };
  const save = async () => {
    if (!form.batchId || !form.teacherId || !form.subject || !form.date || !form.startTime || !form.endTime) return Alert.alert("Required fields", "Complete all timetable details.");
    const payload = { ...form, batchId: Number(form.batchId), teacherId: Number(form.teacherId), startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime, endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime };
    try {
      if (editingId) await updateTimetable(editingId, payload);
      else await createTimetable(payload);
      reset();
      await load();
      Alert.alert("Saved", "Timetable saved.");
    } catch (error) {
      Alert.alert("Could not save", friendlyError(error, "Check date and time format."));
    }
  };

  return (
    <>
      {!readOnly ? (
        <Card>
          <ScreenTitle title={editingId ? "Edit Timetable" : "Add Timetable"} subtitle="Date: YYYY-MM-DD · Time: HH:MM" />
          <ChoiceGroup label="Batch" value={form.batchId} onChange={(batchId) => setForm({ ...form, batchId: String(batchId) })} options={batches.map((item) => ({ label: item.name, value: item.id }))} />
          <ChoiceGroup label="Teacher" value={form.teacherId} onChange={(teacherId) => setForm({ ...form, teacherId: String(teacherId) })} options={teachers.map((item) => ({ label: item.name, value: item.id }))} />
          <CustomInput label="Subject" value={form.subject} onChangeText={(subject) => setForm({ ...form, subject })} />
          <CustomInput label="Date" value={form.date} onChangeText={(date) => setForm({ ...form, date })} placeholder="2026-06-24" />
          <View style={styles.actionRow}>
            <CustomInput label="Start" value={form.startTime} onChangeText={(startTime) => setForm({ ...form, startTime })} placeholder="09:00" style={styles.timeInput} />
            <CustomInput label="End" value={form.endTime} onChangeText={(endTime) => setForm({ ...form, endTime })} placeholder="11:00" style={styles.timeInput} />
          </View>
          <CustomButton title={editingId ? "Save Changes" : "Add Timetable"} onPress={save} />
          {editingId ? <CustomButton title="Cancel" variant="secondary" onPress={reset} style={styles.topGap} /> : null}
        </Card>
      ) : null}
      <Card>
        <ScreenTitle title="Class Timetable" subtitle={`${visible.length} classes`} action={<SectionActions onRefresh={load} />} />
        {visible.map((item) => (
          <View style={styles.listRow} key={item.id}>
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{item.subject}</Text>
              <Text style={styles.listSub}>{batchMap.get(String(item.batchId))?.name || `Batch ${item.batchId}`} · {teacherMap.get(String(item.teacherId))?.name || "Teacher"}</Text>
              <Text style={styles.meta}>{item.date} · {String(item.startTime).slice(0, 5)} - {String(item.endTime).slice(0, 5)}</Text>
            </View>
            {!readOnly ? (
              <View style={styles.miniActions}>
                <Pressable style={styles.editButton} onPress={() => { setEditingId(item.id); setForm({ batchId: String(item.batchId), subject: item.subject, teacherId: String(item.teacherId), date: item.date, startTime: String(item.startTime).slice(0, 5), endTime: String(item.endTime).slice(0, 5) }); }}><Text style={styles.editText}>Edit</Text></Pressable>
                <Pressable style={styles.deleteButton} onPress={() => Alert.alert("Delete class", `Delete ${item.subject}?`, [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => { await deleteTimetable(item.id); await load(); } }])}><Text style={styles.deleteText}>Delete</Text></Pressable>
              </View>
            ) : null}
          </View>
        ))}
        {!visible.length ? <EmptyState text="No timetable records." /> : null}
      </Card>
    </>
  );
}

export function ReportsPanel({ studentId }) {
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [search, setSearch] = useState("");
  const load = async () => {
    const [attendanceResponse, batchResponse] = await Promise.all([getAttendance(), getBatches()]);
    setRecords(attendanceResponse.data);
    setBatches(batchResponse.data);
  };
  useEffect(() => { load().catch(() => {}); }, []);
  const batchMap = useMemo(() => new Map(batches.map((item) => [String(item.id), item])), [batches]);
  const visible = records.filter((item) => {
    if (studentId && String(item.studentId) !== String(studentId)) return false;
    if (batchId && String(item.batchId) !== String(batchId)) return false;
    if (search && !`${item.studentName} ${item.date} ${item.session}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const present = visible.filter((item) => item.status === "PRESENT").length;
  const absent = visible.filter((item) => item.status === "ABSENT").length;
  const percentage = visible.length ? Math.round((present / visible.length) * 100) : 0;
  const download = async () => {
    const rows = visible.map((item) => `<tr><td>${item.date || "-"}</td><td>${item.studentName || "-"}</td><td>${batchMap.get(String(item.batchId))?.name || "-"}</td><td>${item.session || "-"}</td><td>${item.status}</td></tr>`).join("");
    const html = `<html><body style="font-family:Arial;padding:28px;color:#102A43"><h1>Attendance Report</h1><p>Total ${visible.length} · Present ${present} · Absent ${absent} · ${percentage}%</p><table style="width:100%;border-collapse:collapse"><thead><tr><th>Date</th><th>Student</th><th>Batch</th><th>Session</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><style>th,td{border:1px solid #d9e4e8;padding:8px;text-align:left}th{background:#087f75;color:white}</style></body></html>`;
    const result = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(result.uri, { mimeType: "application/pdf", dialogTitle: "Attendance Report" });
  };

  return (
    <Card>
      <ScreenTitle title={studentId ? "My Attendance" : "Attendance Reports"} subtitle="Submitted attendance records" action={<SectionActions onRefresh={load} />} />
      <StatGrid stats={[{ label: "Records", value: visible.length }, { label: "Present", value: present }, { label: "Absent", value: absent }, { label: "Rate", value: `${percentage}%` }]} />
      {!studentId ? <ChoiceGroup label="Filter batch" value={batchId} onChange={setBatchId} options={[{ label: "All batches", value: "" }, ...batches.map((item) => ({ label: item.name, value: String(item.id) }))]} /> : null}
      <CustomInput value={search} onChangeText={setSearch} placeholder="Search student, date or session" />
      <CustomButton title="Share PDF Report" variant="secondary" onPress={download} />
      <View style={styles.topGap}>
        {visible.map((item) => (
          <View style={styles.listRow} key={item.id}>
            <View style={styles.listCopy}>
              <Text style={styles.listTitle}>{item.studentName}</Text>
              <Text style={styles.listSub}>{batchMap.get(String(item.batchId))?.name || `Batch ${item.batchId}`} · {item.date}</Text>
              <Text style={styles.meta}>{item.session}</Text>
            </View>
            <Text style={[styles.badge, item.status === "PRESENT" ? styles.present : styles.absent]}>{item.status}</Text>
          </View>
        ))}
      </View>
      {!visible.length ? <EmptyState text="No submitted attendance." /> : null}
    </Card>
  );
}

export function DeletedRecordsPanel() {
  const [records, setRecords] = useState([]);
  const load = async () => setRecords((await getDeletedRecords()).data);
  useEffect(() => { load().catch(() => {}); }, []);
  return (
    <Card>
      <ScreenTitle title="Deleted Records" subtitle="Audit history" action={<SectionActions onRefresh={load} />} />
      {records.map((item) => (
        <View style={styles.listRow} key={item.id}>
          <View style={styles.listCopy}>
            <Text style={styles.listTitle}>{item.moduleName || "Record"} #{item.recordId}</Text>
            <Text style={styles.listSub}>{item.details || "-"}</Text>
            <Text style={styles.meta}>{item.deletedBy || "system"} · {item.deletedAt ? String(item.deletedAt).replace("T", " ").slice(0, 16) : "-"}</Text>
          </View>
        </View>
      ))}
      {!records.length ? <EmptyState text="No deleted records." /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { color: colors.text, fontSize: 13, fontWeight: "800", marginBottom: 8 },
  choiceWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  choice: { backgroundColor: "#F8FAFC", borderColor: colors.border, borderRadius: 13, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  choiceSelected: { backgroundColor: colors.primaryDark, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  choiceTextSelected: { color: colors.white },
  actionRow: { alignItems: "flex-end", flexDirection: "row", gap: 9 },
  flexButton: { flex: 1 },
  smallButton: { minWidth: 92 },
  listRow: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 10, justifyContent: "space-between", marginBottom: 9, padding: 13 },
  listCopy: { flex: 1 },
  listTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  listSub: { color: colors.muted, fontSize: 12, marginTop: 3 },
  meta: { color: colors.primaryDark, fontSize: 11, fontWeight: "700", marginTop: 4 },
  miniActions: { flexDirection: "row", gap: 6 },
  editButton: { backgroundColor: colors.soft, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  editText: { color: colors.primaryDark, fontSize: 12, fontWeight: "900" },
  deleteButton: { backgroundColor: "#FFF0F1", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  deleteText: { color: colors.red, fontSize: 12, fontWeight: "900" },
  topGap: { marginTop: 10 },
  timeInput: { minWidth: 125 },
  badge: { borderRadius: 10, fontSize: 11, fontWeight: "900", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 7 },
  present: { backgroundColor: "#E8F7EF", color: colors.green },
  absent: { backgroundColor: "#FFF0F1", color: colors.red },
});
