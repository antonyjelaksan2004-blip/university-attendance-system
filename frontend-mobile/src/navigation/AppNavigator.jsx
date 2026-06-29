import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/auth/LoginScreen";
import SuperAdminDashboardScreen from "../screens/mobile/SuperAdminDashboardScreen";
import ManagerDashboardScreen from "../screens/mobile/ManagerDashboardScreen";
import OfficeDashboardScreen from "../screens/mobile/OfficeDashboardScreen";
import TeacherDashboardScreen from "../screens/teacher/TeacherDashboardScreen";
import StudentDashboardScreen from "../screens/student/StudentDashboardScreen";
import {
  addNotificationListeners,
  registerForPushNotifications,
} from "../services/notificationService";

function RootNavigator() {
  const { user, ready } = useAuth();
  const [notificationRefresh, setNotificationRefresh] = useState(0);

  useEffect(() => {
    if (!user?.id) return undefined;

    registerForPushNotifications(user.id).catch((error) => {
      console.log("Push registration failed:", error.message);
    });

    return addNotificationListeners(() => {
      setNotificationRefresh((value) => value + 1);
    });
  }, [user?.id]);

  if (!ready) {
    return <View style={styles.loading}><ActivityIndicator color="#087F75" size="large" /></View>;
  }
  if (!user) return <LoginScreen />;
  if (user.role === "SUPER_ADMIN") return <SuperAdminDashboardScreen />;
  if (user.role === "MANAGER") return <ManagerDashboardScreen />;
  if (user.role === "OFFICE_STAFF") return <OfficeDashboardScreen />;
  if (user.role === "TEACHER") return <TeacherDashboardScreen />;
  return (
    <StudentDashboardScreen notificationRefresh={notificationRefresh} />
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", backgroundColor: "#F3F7F8", flex: 1, justifyContent: "center" },
});

export default function AppNavigator() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
