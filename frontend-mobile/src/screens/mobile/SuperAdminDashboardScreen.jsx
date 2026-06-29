import { useState } from "react";
import { Building2, ShieldCheck, Trash2, UserCog, Users } from "lucide-react-native";
import MobileShell, { ActionGrid, DashboardHero, RowButton } from "./MobileShell";
import {
  CampusManager,
  DashboardStats,
  DeletedRecordsPanel,
  UserManager,
  useDashboardStats,
} from "./shared";

export default function SuperAdminDashboardScreen() {
  const [view, setView] = useState("home");
  const { stats, loadStats } = useDashboardStats();

  return (
    <MobileShell title={view === "home" ? "Super Admin" : view} onBack={view !== "home" ? () => setView("home") : undefined} onRefresh={view === "home" ? loadStats : undefined}>
      {view === "home" ? (
        <>
          <DashboardHero eyebrow="Super Admin Console" title="System Control" subtitle="Manage managers, users, campus locations and the complete audit history." />
          <DashboardStats stats={stats} mode="admin" />
          <ActionGrid>
            <RowButton accent="#2563EB" icon={UserCog} title="Managers" text="Add, edit and manage accounts" onPress={() => setView("Managers")} />
            <RowButton accent="#6366F1" icon={Users} title="All Users" text="Review every active account" onPress={() => setView("All Users")} />
            <RowButton accent="#EF4444" icon={Building2} title="Campus" text="Attendance locations and radius" onPress={() => setView("Campus")} />
            <RowButton accent="#F59E0B" icon={Trash2} title="Audit" text="Review deleted records" onPress={() => setView("Deleted Records")} />
          </ActionGrid>
        </>
      ) : null}
      {view === "Managers" ? <UserManager title="Manager" role="MANAGER" onChanged={loadStats} /> : null}
      {view === "All Users" ? (
        <>
          <UserManager title="Manager" role="MANAGER" readOnly />
          <UserManager title="Office Staff" role="OFFICE_STAFF" readOnly />
          <UserManager title="Teacher" role="TEACHER" readOnly />
          <UserManager title="Student" role="STUDENT" includeStudent readOnly />
        </>
      ) : null}
      {view === "Campus" ? <CampusManager /> : null}
      {view === "Deleted Records" ? <DeletedRecordsPanel /> : null}
    </MobileShell>
  );
}
