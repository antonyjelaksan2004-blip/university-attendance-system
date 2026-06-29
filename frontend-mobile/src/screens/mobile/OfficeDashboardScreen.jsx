import { useState } from "react";
import {
  CalendarDays,
  FileBarChart,
  GraduationCap,
  Layers3,
  UsersRound,
} from "lucide-react-native";
import MobileShell, { ActionGrid, DashboardHero, RowButton } from "./MobileShell";
import {
  BatchManager,
  DashboardStats,
  ReportsPanel,
  TimetableManager,
  UserManager,
  useDashboardStats,
} from "./shared";

export default function OfficeDashboardScreen() {
  const [view, setView] = useState("home");
  const { stats, loadStats } = useDashboardStats();

  return (
    <MobileShell title={view === "home" ? "Office Staff" : view} onBack={view !== "home" ? () => setView("home") : undefined} onRefresh={view === "home" ? loadStats : undefined}>
      {view === "home" ? (
        <>
          <DashboardHero eyebrow="Office Workspace" title="Student Services" subtitle="Manage student records, batches, schedules and official attendance reports." />
          <DashboardStats stats={stats} />
          <ActionGrid>
            <RowButton accent="#D97706" icon={UsersRound} title="Students" text="Add, edit and move students" onPress={() => setView("Students")} />
            <RowButton accent="#475569" icon={Layers3} title="Batches" text="Create and edit batch records" onPress={() => setView("Batches")} />
            <RowButton accent="#2563EB" icon={GraduationCap} title="Teachers" text="View the teacher directory" onPress={() => setView("Teachers")} />
            <RowButton accent="#0891B2" icon={CalendarDays} title="Timetable" text="View scheduled classes" onPress={() => setView("Timetable")} />
            <RowButton accent="#16A34A" icon={FileBarChart} title="Reports" text="Filter and share attendance PDF" onPress={() => setView("Reports")} />
          </ActionGrid>
        </>
      ) : null}
      {view === "Students" ? <UserManager title="Student" role="STUDENT" includeStudent onChanged={loadStats} /> : null}
      {view === "Batches" ? <BatchManager onChanged={loadStats} /> : null}
      {view === "Teachers" ? <UserManager title="Teacher" role="TEACHER" readOnly /> : null}
      {view === "Timetable" ? <TimetableManager readOnly /> : null}
      {view === "Reports" ? <ReportsPanel /> : null}
    </MobileShell>
  );
}
