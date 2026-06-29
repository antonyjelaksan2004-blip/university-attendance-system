import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../styles/colors";

export default function CustomInput({ label, error, style, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        autoCapitalize={props.autoCapitalize || "none"}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        placeholderTextColor="#94A3B8"
        selectionColor={colors.primary}
        style={[
          styles.input,
          focused && styles.focused,
          error && styles.inputError,
          props.multiline && styles.multiline,
          style,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 15 },
  label: { color: colors.text, fontSize: 13, fontWeight: "850", marginBottom: 8 },
  input: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 2,
  },
  inputError: { borderColor: colors.red },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: "top" },
  error: { color: colors.red, fontSize: 12, fontWeight: "700", marginTop: 6 },
});
