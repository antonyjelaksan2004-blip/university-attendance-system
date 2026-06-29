import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

export default function CustomButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) {
  const gradients = {
    primary: [colors.primaryDark, colors.primary, colors.cyan],
    danger: ["#991B1B", colors.red],
    success: ["#15803D", "#22C55E"],
    secondary: ["#FFFFFF", "#E8EEF5"],
  };
  const textColor = variant === "secondary" ? colors.text : colors.white;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={gradients[variant] || gradients.primary}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[styles.button, variant === "secondary" && styles.secondary]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 15,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  button: {
    alignItems: "center",
    borderRadius: 15,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
  },
  secondary: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  text: { fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
});
