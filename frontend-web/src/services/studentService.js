import api from "./api";

export const getStudents = () => api.get("/students/");
export const createStudent = (payload) => api.post("/students/", payload);
export const updateStudent = (id, payload) => api.put(`/students/${id}/`, payload);
export const deleteStudent = (id) => api.delete(`/students/${id}/`);
