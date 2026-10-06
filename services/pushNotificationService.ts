import * as Device from "expo-device";
import Constants from "expo-constants";
import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import type * as NotificationsType from "expo-notifications";

export const INVENTORY_ALERTS_CHANNEL_ID = "inventory-alerts";

/**
 * Lazily load expo-notifications only in environments where push is supported.
 * On Android inside Expo Go (SDK 53+), expo-notifications throws at import time
 * because Google removed legacy FCM support. Loading lazily prevents the app from crashing.
 */
export function getNotificationsModule(): typeof NotificationsType | null {
  if (Platform.OS === "web") return null;

  // Push notifications on Android are unsupported inside Expo Go in SDK 53+
  if (Platform.OS === "android" && isRunningInExpoGo()) {
    return null;
  }

  try {
    return require("expo-notifications");
  } catch (err) {
    if (__DEV__) {
      console.warn("[PushService] Could not load expo-notifications:", err);
    }
    return null;
  }
}

/**
 * Configure notification presentation behavior in foreground
 */
export function setupForegroundNotificationHandler() {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[PushService] Error setting notification handler:", err);
    }
  }
}

/**
 * Request notification permissions, configure channels on Android,
 * and obtain the device's Expo Push Token.
 */
export async function obtainPushToken(): Promise<string | null> {
  // Simulators and Web environments cannot register real remote push tokens
  if (Platform.OS === "web" || !Device.isDevice) {
    if (__DEV__) {
      console.log(
        "[PushService] Remote push tokens require a physical device. Simulator or Web detected.",
      );
    }
    return null;
  }

  // Android Push notifications were removed from Expo Go in SDK 53+
  if (Platform.OS === "android" && isRunningInExpoGo()) {
    if (__DEV__) {
      console.warn(
        "[PushService] Android Push Notifications are not supported in Expo Go (SDK 53+). Use a development build (npx expo run:android or EAS Build) to test push notifications.",
      );
    }
    return null;
  }

  const Notifications = getNotificationsModule();
  if (!Notifications) return null;

  try {
    // Configure high-priority notification channel for Android 8.0+
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(INVENTORY_ALERTS_CHANNEL_ID, {
        name: "Alertas de Inventario",
        description: "Notificaciones de stock agotado y eventos críticos de inventario",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#c0c1ff",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Check and request user permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[PushService] Notification permission was denied by the user.");
      return null;
    }

    // Resolve EAS project ID
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.error("[PushService] Missing EAS projectId in app.json extra.eas.projectId");
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenResponse.data;
  } catch (error) {
    console.warn("[PushService] Failed to obtain Expo push token:", error);
    return null;
  }
}
