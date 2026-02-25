import { Stack } from "expo-router";

export default function HostLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="HostFormScreen"
        options={{ headerShown: true, title: "Become a Host" }}
      />
      <Stack.Screen
        name="ManageListingsScreen"
        options={{ headerShown: true, title: "Manage Listings" }}
      />
    </Stack>
  );
}
