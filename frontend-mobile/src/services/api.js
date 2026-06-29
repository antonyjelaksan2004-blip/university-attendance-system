import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

const SERVER_KEY = "attendance_api_url";
const PHONE_SERVER = "http://192.168.227.157:8085/api";
const DEFAULT_SERVER =
  Platform.OS === "web" ? "http://localhost:8085/api" : PHONE_SERVER;

const normalizeUrl = (value) => {
  const clean = String(value || "").trim().replace(/\/+$/, "");
  if (!clean) return DEFAULT_SERVER;
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: DEFAULT_SERVER,
  timeout: 12000,
});

export async function initializeApi() {
  const saved = await AsyncStorage.getItem(SERVER_KEY);
  // A browser preview runs on the same laptop as the backend. Using localhost
  // prevents an old saved Wi-Fi address from talking to a stale server.
  api.defaults.baseURL =
    Platform.OS === "web" ? DEFAULT_SERVER : normalizeUrl(saved || DEFAULT_SERVER);
  return api.defaults.baseURL;
}

export async function setApiUrl(value) {
  const url = normalizeUrl(value);
  api.defaults.baseURL = url;
  await AsyncStorage.setItem(SERVER_KEY, url);
  return url;
}

export function getApiUrl() {
  return api.defaults.baseURL;
}

export async function testApiConnection(value) {
  const url = normalizeUrl(value);
  await axios.get(`${url}/reports/dashboard`, { timeout: 8000 });
  return url;
}

export default api;
