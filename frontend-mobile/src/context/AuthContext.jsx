import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initializeApi } from "../services/api";

const AuthContext = createContext(null);
const SESSION_KEY = "attendance_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([initializeApi(), AsyncStorage.getItem(SESSION_KEY)])
      .then(([, session]) => {
        if (!session) return;
        const parsed = JSON.parse(session);
        setUser(parsed.user);
        setToken(parsed.token);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const login = async (data) => {
    const nextUser = {
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      studentNumber: data.studentNumber,
      batchId: data.batchId,
    };
    setUser(nextUser);
    setToken(data.token);
    await AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user: nextUser, token: data.token })
    );
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const value = useMemo(
    () => ({ user, token, ready, login, logout }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
