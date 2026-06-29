import { StyleSheet, Text, View } from "react-native";
import { colors } from "../styles/colors";

export default function Header({ title }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
});
