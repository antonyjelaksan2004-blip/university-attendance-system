import api from "./api";

export const getAttendance = () => api.get("/attendance");
export const markAttendance = (payload) => api.post("/attendance", payload);
export const updateAttendance = (id, payload) => api.put(`/attendance/${id}`, payload);
export const getAttendanceReports = () => api.get("/attendance");
