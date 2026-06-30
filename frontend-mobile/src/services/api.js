import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const SERVER_KEY = "attendance_api_url";
const DEFAULT_SERVER =
  "https://university-attendance-system-production.up.railway.app/api";

const isLocalServer = (value) =>
  /localhost|127\.0\.0\.1|192\.168\.|10\.0\.2\.2|:8082|:8085/i.test(
    String(value || "")
  );

const normalizeUrl = (value) => {
  const clean = String(value || "").trim().replace(/\/+$/, "");
  if (!clean || isLocalServer(clean)) return DEFAULT_SERVER;
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: DEFAULT_SERVER,
  timeout: 12000,
});

export async function initializeApi() {
  const saved = await AsyncStorage.getItem(SERVER_KEY);
  api.defaults.baseURL = normalizeUrl(saved || DEFAULT_SERVER);
  if (saved !== api.defaults.baseURL) {
    await AsyncStorage.setItem(SERVER_KEY, api.defaults.baseURL);
  }
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
