import { Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { colors } from "@/constants/design";

const icons: Record<string, string> = { index: "⌂", library: "♫", setlists: "≡", profile: "◉" };

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: "#77706C",
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color }) => (
          <Text style={[styles.icon, { color }]}>{icons[route.name] ?? "·"}</Text>
        ),
        sceneStyle: { backgroundColor: colors.background },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="library" options={{ title: "Biblioteca" }} />
      <Tabs.Screen name="setlists" options={{ title: "Setlists" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    height: 84,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: "#171717F7",
    borderTopColor: colors.border,
  },
  label: { fontSize: 10, fontWeight: "700" },
  icon: { fontSize: 22, height: 26 },
});
