import api from "./api";

export const startClassSession = (payload) => api.post("/class-sessions/start", payload);
const freshConfig = () => ({
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
  params: { fresh: Date.now() },
});

export const getActiveClassSession = () =>
  api.get("/class-sessions/active", freshConfig());
export const getClassSessionAttendance = (id) =>
  api.get(`/class-sessions/${id}/attendance`, freshConfig());
export const submitClassSession = (id) => api.post(`/class-sessions/${id}/submit`);
export const markMyAttendance = (payload) => api.post("/class-sessions/mark-my-attendance", payload);
