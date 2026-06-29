import * as Location from "expo-location";
import { Platform } from "react-native";

export async function getReliableLocation() {
  if (Platform.OS === "web") {
    if (!globalThis.navigator?.geolocation) {
      throw new Error("Location is not supported by this browser.");
    }

    return new Promise((resolve, reject) => {
      globalThis.navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 0,
          },
        }),
        (error) => {
          const messages = {
            1: "Location permission was denied. Allow location access in the browser address bar and try again.",
            2: "Your current location is unavailable. Turn on Windows location services and try again.",
            3: "Location request timed out. Enable precise location and try again.",
          };
          reject(new Error(messages[error.code] || "Current location could not be read."));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }

  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("Location permission is required. Enable precise location and try again.");
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error("Turn on phone location services and try again.");
  }

  const readings = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const reading = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      mayShowUserSettingsDialog: true,
    });
    readings.push(reading);
    if ((reading.coords.accuracy || 999) <= 20) {
      break;
    }
  }

  return readings.reduce((best, reading) => {
    const bestAccuracy = best?.coords?.accuracy ?? Number.POSITIVE_INFINITY;
    const readingAccuracy = reading.coords.accuracy ?? Number.POSITIVE_INFINITY;
    return readingAccuracy < bestAccuracy ? reading : best;
  }, null);
}
