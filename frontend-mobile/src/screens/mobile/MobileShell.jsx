import {
  Alert,
  Image,
  Pressable,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  LogOut,
  RefreshCw,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../styles/colors";

export default function MobileShell({
  children,
  title,
  onBack,
  refreshing = false,
  onRefresh,
}) {
  const { user, logout } = useAuth();
  const role = (user?.role || "").replaceAll("_", " ");

  const confirmLogout = () => {
    if (Platform.OS === "web") {
      logout();
      return;
    }

    Alert.alert(
      "Log out",
      "Do you want to end this session?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log out", style: "destructive", onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <View style={styles.brandRow}>
          {onBack ? (
            <Pressable accessibilityLabel="Back" onPress={onBack} style={styles.iconButton}>
              <ArrowLeft color={colors.text} size={22} />
            </Pressable>
          ) : (
            <Image source={require("../../../assets/app-icon.png")} style={styles.logo} />
          )}
          <View style={styles.identity}>
            <Text numberOfLines={1} style={styles.name}>{user?.name || "User"}</Text>
            <Text numberOfLines={1} style={styles.role}>{title || role}</Text>
          </View>
        </View>
        <Pressable accessibilityLabel="Logout" onPress={confirmLogout} style={styles.iconButton}>
          <LogOut color={colors.red} size={21} />
        </Pressable>
      </View>

      <LinearGradient colors={["#F8FAFC", "#EFF6FF", "#F0FDFA"]} style={styles.pageBackground}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
        >
          {children}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient
        colors={[colors.primary, colors.indigo, colors.cyan]}
        end={{ x: 1, y: 0 }}
        start={{ x: 0, y: 0 }}
        style={styles.cardAccent}
      />
      {children}
    </View>
  );
}

export function ScreenTitle({ title, subtitle, action }) {
  return (
    <View style={styles.titleRow}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function StatGrid({ stats }) {
  return (
    <View style={styles.stats}>
      {stats.map((item) => (
        <View key={item.label} style={styles.stat}>
          <LinearGradient
            colors={[colors.primary, colors.indigo, colors.cyan]}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={styles.statAccent}
          />
          <Text style={styles.statLabel}>{item.label}</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function RowButton({ title, text, onPress, icon: Icon, accent = colors.primary }) {
  const palettes = {
    "#2563EB": ["#0F766E", "#06B6D4"],
    "#6366F1": ["#4338CA", "#8B5CF6"],
    "#0891B2": ["#0E7490", "#22D3EE"],
    "#16A34A": ["#15803D", "#22C55E"],
    "#F59E0B": ["#92400E", "#F59E0B"],
    "#EF4444": ["#991B1B", "#EF4444"],
  };
  const gradient = palettes[accent] || [colors.primaryDark, colors.primary];

  return (
    <Pressable style={({ pressed }) => [styles.rowButton, pressed && styles.pressed]} onPress={onPress}>
      <LinearGradient colors={gradient} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.rowGradient}>
        <View style={styles.actionGlow} />
        <View style={styles.rowIcon}>
          {Icon ? <Icon color={colors.white} size={23} /> : <RefreshCw color={colors.white} size={23} />}
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>{title}</Text>
          {text ? <Text numberOfLines={2} style={styles.rowText}>{text}</Text> : null}
          <View style={styles.openPill}><Text style={styles.openText}>OPEN</Text></View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function ActionGrid({ children }) {
  return <View style={styles.actionGrid}>{children}</View>;
}

export function DashboardHero({ eyebrow, title, subtitle }) {
  return (
    <LinearGradient
      colors={[colors.navyDeep, colors.navy, "#172554"]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.hero}
    >
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />
      <Text style={styles.heroEyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </LinearGradient>
  );
}

export function EmptyState({ text = "No records found." }) {
  return <Text style={styles.empty}>{text}</Text>;
}

export function SectionActions({ onRefresh }) {
  return (
    <Pressable accessibilityLabel="Refresh" onPress={onRefresh} style={styles.iconButton}>
      <RefreshCw color={colors.primary} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  pageBackground: { flex: 1 },
  topbar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomColor: "rgba(148,163,184,0.24)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 76,
    paddingHorizontal: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 5,
  },
  brandRow: { alignItems: "center", flex: 1, flexDirection: "row", gap: 11 },
  logo: { borderRadius: 13, height: 44, width: 44 },
  identity: { flex: 1 },
  name: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  role: { color: colors.text, fontSize: 17, fontWeight: "900", marginTop: 2, textTransform: "uppercase" },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderColor: "#CCFBF1",
    borderRadius: 13,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  content: { padding: 16, paddingBottom: 68 },
  titleRow: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 14 },
  titleBlock: { flex: 1 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "rgba(148,163,184,0.24)",
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
    padding: 17,
    paddingTop: 21,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 22,
    elevation: 4,
  },
  cardAccent: { height: 4, left: 0, position: "absolute", right: 0, top: 0 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  stat: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: "46%",
    overflow: "hidden",
    padding: 14,
    paddingTop: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 15,
    elevation: 3,
  },
  statAccent: { height: 4, left: 0, position: "absolute", right: 0, top: 0 },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  statValue: { color: colors.text, fontSize: 23, fontWeight: "900", marginTop: 7 },
  rowButton: {
    borderRadius: 20,
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 154,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 5,
  },
  rowGradient: { flex: 1, minHeight: 154, padding: 15 },
  actionGlow: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 70, height: 120, position: "absolute", right: -40, top: -35, width: 120 },
  rowIcon: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.17)", borderColor: "rgba(255,255,255,0.22)", borderRadius: 13, borderWidth: 1, height: 46, justifyContent: "center", width: 46 },
  rowCopy: { flex: 1, marginTop: 12 },
  rowTitle: { color: colors.white, fontSize: 16, fontWeight: "900" },
  rowText: { color: "rgba(255,255,255,0.82)", fontSize: 12, lineHeight: 17, marginTop: 5 },
  openPill: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 99, marginTop: "auto", paddingHorizontal: 11, paddingVertical: 7 },
  openText: { color: colors.white, fontSize: 10, fontWeight: "900" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  hero: { borderColor: "rgba(255,255,255,0.12)", borderRadius: 24, borderWidth: 1, marginBottom: 16, minHeight: 184, overflow: "hidden", padding: 21, shadowColor: colors.navyDeep, shadowOffset: { width: 0, height: 13 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 6 },
  heroGlowOne: {
    backgroundColor: "rgba(20,184,166,0.24)",
    borderRadius: 90,
    height: 180,
    position: "absolute",
    right: -60,
    top: -80,
    width: 180,
  },
  heroGlowTwo: { backgroundColor: "rgba(99,102,241,0.17)", borderRadius: 80, bottom: -90, height: 160, left: -50, position: "absolute", width: 160 },
  heroEyebrow: { color: "#5EEAD4", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  heroTitle: { color: colors.white, fontSize: 30, fontWeight: "900", marginTop: 14 },
  heroSubtitle: { color: "#C7D2E2", fontSize: 13, lineHeight: 20, marginTop: 9, maxWidth: "88%" },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  empty: { color: colors.muted, paddingVertical: 18, textAlign: "center" },
});
