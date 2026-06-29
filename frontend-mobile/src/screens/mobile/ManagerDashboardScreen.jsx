import { useState } from "react";
import {
  Building2,
  CalendarDays,
  FileBarChart,
  GraduationCap,
  Layers3,
  UserRoundCog,
  UsersRound,
} from "lucide-react-native";
import MobileShell, { ActionGrid, DashboardHero, RowButton } from "./MobileShell";
import {
  BatchManager,
  CampusManager,
  DashboardStats,
  ReportsPanel,
  TimetableManager,
  UserManager,
  useDashboardStats,
} from "./shared";

export default function ManagerDashboardScreen() {
  const [view, setView] = useState("home");
  const { stats, loadStats } = useDashboardStats();

  return (
    <MobileShell title={view === "home" ? "Manager" : view} onBack={view !== "home" ? () => setView("home") : undefined} onRefresh={view === "home" ? loadStats : undefined}>
      {view === "home" ? (
        <>
          <DashboardHero eyebrow="Manager Workspace" title="Operations" subtitle="Manage people, batches, schedules, locations and attendance from one connected workspace." />
          <DashboardStats stats={stats} />
          <ActionGrid>
            <RowButton accent="#2563EB" icon={GraduationCap} title="Teachers" text="Add, edit and manage teacher accounts" onPress={() => setView("Teachers")} />
            <RowButton accent="#6366F1" icon={UserRoundCog} title="Office Staff" text="Manage office staff accounts" onPress={() => setView("Office Staff")} />
            <RowButton accent="#D97706" icon={UsersRound} title="Students" text="Accounts and batch assignment" onPress={() => setView("Students")} />
            <RowButton accent="#475569" icon={Layers3} title="Batches" text="Create and edit batch records" onPress={() => setView("Batches")} />
            <RowButton accent="#EF4444" icon={Building2} title="Campus" text="GPS location and allowed radius" onPress={() => setView("Campus")} />
            <RowButton accent="#0891B2" icon={CalendarDays} title="Timetable" text="Manage class schedules" onPress={() => setView("Timetable")} />
            <RowButton accent="#16A34A" icon={FileBarChart} title="Reports" text="Attendance and PDF reports" onPress={() => setView("Reports")} />
          </ActionGrid>
        </>
      ) : null}
      {view === "Teachers" ? <UserManager title="Teacher" role="TEACHER" onChanged={loadStats} /> : null}
      {view === "Office Staff" ? <UserManager title="Office Staff" role="OFFICE_STAFF" onChanged={loadStats} /> : null}
      {view === "Students" ? <UserManager title="Student" role="STUDENT" includeStudent onChanged={loadStats} /> : null}
      {view === "Batches" ? <BatchManager onChanged={loadStats} /> : null}
      {view === "Campus" ? <CampusManager /> : null}
      {view === "Timetable" ? <TimetableManager /> : null}
      {view === "Reports" ? <ReportsPanel /> : null}
    </MobileShell>
  );
}
