import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  if (!publishableKey?.trim()) {
    return (
      <View style={styles.missingKey}>
        <Text style={styles.missingKeyText}>
          Añade EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY en mobile/.env
        </Text>
        <Text style={styles.missingKeySub}>Ver docs/CLERK_EXPO.md</Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  missingKey: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 24,
  },
  missingKeyText: { color: "#f8fafc", fontSize: 16, textAlign: "center" },
  missingKeySub: { color: "#94a3b8", marginTop: 8 },
});
