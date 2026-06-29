import api from "./api";

export const getAttendance = () => api.get("/attendance");
export const updateAttendance = (id, payload) => api.put(`/attendance/${id}`, payload);
