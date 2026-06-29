import api from "./api";

export const getTimetable = () => api.get("/timetable");
export const createTimetable = (payload) => api.post("/timetable", payload);
export const updateTimetable = (id, payload) => api.put(`/timetable/${id}`, payload);
export const deleteTimetable = (id) => api.delete(`/timetable/${id}`);
