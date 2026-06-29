import api from "./api";

export const getCampuses = () => api.get("/campus");
export const createCampus = (payload) => api.post("/campus", payload);
export const updateCampus = (id, payload) => api.put(`/campus/${id}`, payload);
export const deleteCampus = (id) => api.delete(`/campus/${id}`);