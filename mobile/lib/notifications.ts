import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";

const KEY_CADUCADOS_ENABLED = "notification_caducados_enabled";
const KEY_LAST_ALERT_DATE = "notification_caducados_last_alert";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getCaducadosNotificationEnabled(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(KEY_CADUCADOS_ENABLED);
  return v === "true";
}

export async function setCaducadosNotificationEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEY_CADUCADOS_ENABLED, enabled ? "true" : "false");
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status === "granted";
}

/** Call after loading medicamentos; if notifications enabled and there are expired items, shows a local notification (at most once per day). */
export async function maybeNotifyCaducados(expiredCount: number): Promise<void> {
  if (expiredCount <= 0) return;
  const enabled = await getCaducadosNotificationEnabled();
  if (!enabled) return;
  const today = new Date().toISOString().slice(0, 10);
  const last = await SecureStore.getItemAsync(KEY_LAST_ALERT_DATE);
  if (last === today) return;
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Medicamentos caducados",
      body: expiredCount === 1
        ? "Tienes 1 medicamento caducado. Revisa la lista."
        : `Tienes ${expiredCount} medicamentos caducados. Revisa la lista.`,
    },
    trigger: null,
  });
  await SecureStore.setItemAsync(KEY_LAST_ALERT_DATE, today);
}
