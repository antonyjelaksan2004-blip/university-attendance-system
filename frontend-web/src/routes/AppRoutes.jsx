import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import OtpVerify from "../pages/auth/OtpVerify.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import SuperAdminDashboard from "../pages/dashboard/SuperAdminDashboard.jsx";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard.jsx";
import OfficeStaffDashboard from "../pages/dashboard/OfficeStaffDashboard.jsx";
import TeacherDashboard from "../pages/dashboard/TeacherDashboard.jsx";
import StudentDashboard from "../pages/dashboard/StudentDashboard.jsx";
import StudentList from "../pages/students/StudentList.jsx";
import BatchList from "../pages/batches/BatchList.jsx";
import MarkAttendance from "../pages/attendance/MarkAttendance.jsx";
import TimetableList from "../pages/timetable/TimetableList.jsx";
import AttendanceReport from "../pages/attendance/AttendanceReport.jsx";
import CampusList from "../pages/campus/CampusList.jsx";
import AddTeacher from "../pages/manager/AddTeacher.jsx";
import AddOfficeStaff from "../pages/manager/AddOfficeStaff.jsx";
import AddStudentAccount from "../pages/manager/AddStudentAccount.jsx";
import AddCampusLocation from "../pages/manager/AddCampusLocation.jsx";
import TeachersList from "../pages/manager/TeachersList.jsx";
import OfficeStaffList from "../pages/manager/OfficeStaffList.jsx";
import TakeAttendance from "../pages/teacher/TakeAttendance.jsx";
import ClassAttendance from "../pages/student/ClassAttendance.jsx";
import AddStudentByStaff from "../pages/office/AddStudentByStaff.jsx";
import StudentRecords from "../pages/office/StudentRecords.jsx";
import OfficeReports from "../pages/office/OfficeReports.jsx";
import TeacherDirectory from "../pages/office/TeacherDirectory.jsx";
import AddBatchByManager from "../pages/manager/AddBatchByManager.jsx";
import BatchRecords from "../pages/office/BatchRecords.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verify" element={<OtpVerify />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/dashboard/manager" element={<ManagerDashboard />} />
        <Route path="/dashboard/office-staff" element={<OfficeStaffDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/manager/add-teacher" element={<AddTeacher />} />
        <Route path="/manager/teachers" element={<TeachersList />} />
        <Route path="/manager/add-office-staff" element={<AddOfficeStaff />} />
        <Route path="/manager/office-staff" element={<OfficeStaffList />} />
        <Route path="/manager/add-student" element={<AddStudentAccount />} />
        <Route path="/manager/add-batch" element={<AddBatchByManager />} />
        <Route path="/manager/add-campus" element={<AddCampusLocation />} />
        <Route path="/teacher/take-attendance" element={<TakeAttendance />} />
        <Route path="/student/class-attendance" element={<ClassAttendance />} />
        <Route path="/office/add-student" element={<AddStudentByStaff />} />
        <Route path="/office/add-batch" element={<AddBatchByManager />} />
        <Route path="/office/batches" element={<BatchRecords />} />
        <Route path="/office/students" element={<StudentRecords />} />
        <Route path="/office/teachers" element={<TeacherDirectory />} />
        <Route path="/office/reports" element={<OfficeReports />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/batches" element={<BatchList />} />
        <Route path="/attendance/mark" element={<MarkAttendance />} />
        <Route path="/attendance/reports" element={<AttendanceReport />} />
        <Route path="/timetable" element={<TimetableList />} />
        <Route path="/campus" element={<CampusList />} />
      </Route>
    </Routes>
  );
}
