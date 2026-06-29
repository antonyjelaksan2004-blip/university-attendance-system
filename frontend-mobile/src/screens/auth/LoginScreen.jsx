import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { useAuth } from "../../context/AuthContext";
import {
  forgotPassword,
  loginUser,
  resetPassword,
  verifyOtp,
} from "../../services/authService";
import { colors } from "../../styles/colors";

export default function LoginScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (action) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (err) {
      const networkMessage = err.request && !err.response
        ? "Server connection failed. Check your internet or Wi-Fi connection and try again."
        : null;
      setError(networkMessage || err.response?.data?.message || err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => run(async () => {
    const response = await loginUser({ email: email.trim(), password });
    await login(response.data);
  });

  const sendOtp = () => run(async () => {
    const response = await forgotPassword({ email: email.trim() });
    setMessage(response.data.message || "OTP sent to your email.");
    setMode("otp");
  });

  const checkOtp = () => run(async () => {
    await verifyOtp({ email: email.trim(), otp: otp.trim() });
    setMode("reset");
    setMessage("OTP verified.");
  });

  const savePassword = () => run(async () => {
    if (password !== confirmPassword) throw new Error("Passwords do not match.");
    await resetPassword({ email: email.trim(), otp: otp.trim(), newPassword: password });
    setMode("login");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setMessage("Password changed. Login with your new password.");
  });

  return (
    <LinearGradient colors={["#07111F", "#0F172A", "#172554"]} style={styles.safe}>
      <View style={styles.glowTeal} />
      <View style={styles.glowIndigo} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image source={require("../../../assets/app-icon.png")} style={styles.logo} />
            <Text style={styles.brandName}>University Attendance</Text>
            <Text style={styles.brandLine}>Secure attendance, built for every role.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              {mode === "login" ? "Welcome back" : mode === "forgot" ? "Forgot password" : mode === "otp" ? "Verify OTP" : "New password"}
            </Text>

            {message ? <Text style={styles.success}>{message}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <>
              <CustomInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="name@university.com"
              />
              {mode === "login" || mode === "reset" ? (
                <CustomInput
                  label={mode === "reset" ? "New password" : "Password"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter password"
                />
              ) : null}
              {mode === "otp" ? (
                <CustomInput label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholder="6-digit OTP" />
              ) : null}
              {mode === "reset" ? (
                <CustomInput label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Re-enter password" />
              ) : null}

              <CustomButton
                loading={loading}
                title={mode === "login" ? "Sign In" : mode === "forgot" ? "Send OTP" : mode === "otp" ? "Verify OTP" : "Save Password"}
                onPress={mode === "login" ? handleLogin : mode === "forgot" ? sendOtp : mode === "otp" ? checkOtp : savePassword}
              />

              <View style={styles.links}>
                <Pressable onPress={() => setMode(mode === "login" ? "forgot" : "login")}>
                  <Text style={styles.link}>{mode === "login" ? "Forgot password?" : "Back to login"}</Text>
                </Pressable>
              </View>
            </>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  page: { flexGrow: 1, justifyContent: "center", padding: 18, paddingVertical: 28 },
  brand: { alignItems: "center", marginBottom: 24 },
  logo: { borderColor: "rgba(255,255,255,0.26)", borderRadius: 24, borderWidth: 1, height: 92, width: 92 },
  brandName: { color: colors.white, fontSize: 27, fontWeight: "900", marginTop: 14 },
  brandLine: { color: "#BFD8E5", fontSize: 14, marginTop: 6 },
  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.32,
    shadowRadius: 36,
    elevation: 12,
  },
  title: { color: colors.text, fontSize: 27, fontWeight: "900", marginBottom: 20 },
  success: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0", borderRadius: 12, borderWidth: 1, color: colors.green, fontWeight: "700", marginBottom: 12, padding: 11 },
  error: { backgroundColor: "#FFF1F2", borderColor: "#FECDD3", borderRadius: 12, borderWidth: 1, color: colors.red, fontWeight: "700", marginBottom: 12, padding: 11 },
  links: { alignItems: "center", marginTop: 18 },
  link: { color: colors.primary, fontWeight: "800" },
  glowTeal: { backgroundColor: "rgba(20,184,166,0.22)", borderRadius: 180, bottom: -110, height: 300, left: -120, position: "absolute", width: 300 },
  glowIndigo: { backgroundColor: "rgba(99,102,241,0.20)", borderRadius: 170, height: 280, position: "absolute", right: -120, top: -90, width: 280 },
});
