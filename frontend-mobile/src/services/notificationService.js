import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(userId) {
  if (!userId || !Device.isDevice) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("class-alerts", {
      name: "Class alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;

  if (finalStatus !== "granted") {
    const requestedPermission =
      await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error("Run 'npx eas-cli init' to configure the Expo project ID");
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  await api.post("/notifications/push-token", {
    userId,
    pushToken: tokenResponse.data,
  });

  return tokenResponse.data;
}

export function addNotificationListeners(onClassStarted) {
  const receivedSubscription =
    Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data?.type === "CLASS_STARTED") {
        onClassStarted?.(data);
      }
    });

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === "CLASS_STARTED") {
        onClassStarted?.(data);
      }
    });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
