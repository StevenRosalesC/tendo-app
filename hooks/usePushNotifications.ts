import { useAuth } from "@clerk/expo";
import type * as NotificationsType from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import tendoApi from "../services/api";
import {
  getNotificationsModule,
  obtainPushToken,
  setupForegroundNotificationHandler,
} from "../services/pushNotificationService";

// Initialize foreground notification presentation handler safely
setupForegroundNotificationHandler();

export function usePushNotifications() {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<NotificationsType.EventSubscription | null>(null);
  const responseListener = useRef<NotificationsType.EventSubscription | null>(null);

  // 1. Obtain and register push token on login
  useEffect(() => {
    if (!isSignedIn || Platform.OS === "web") return;

    let isMounted = true;

    async function registerDevice() {
      try {
        const pushToken = await obtainPushToken();
        if (!pushToken || !isMounted) return;

        setExpoPushToken(pushToken);

        const clerkToken = await getToken();
        if (!clerkToken || !isMounted) return;

        const platform = Platform.OS === "android" ? "android" : "ios";
        await tendoApi.registerDeviceToken(clerkToken, pushToken, platform);
        if (__DEV__) {
          console.log("[PushNotification] Device registered successfully:", pushToken);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("[PushNotification] Error syncing push token with backend:", error);
        }
      }
    }

    registerDevice();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn]);

  // 2. Set up incoming notification & interaction listeners
  useEffect(() => {
    const Notifications = getNotificationsModule();
    if (!Notifications) return;

    // Triggered when a notification is received while the app is foregrounded
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          if (__DEV__) {
            console.log("[PushNotification] Notification received in foreground:", notification);
          }
        },
      );

      // Triggered when a user taps/interacts with a notification banner
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data;
          if (__DEV__) {
            console.log("[PushNotification] User interacted with notification:", data);
          }

          // Navigate to inventory on OUT_OF_STOCK alert
          if (data?.event === "OUT_OF_STOCK") {
            router.push("/inventory");
          }
        },
      );
    } catch (err) {
      if (__DEV__) {
        console.warn("[PushNotification] Error setting up notification listeners:", err);
      }
    }

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  return {
    expoPushToken,
  };
}

export default usePushNotifications;
