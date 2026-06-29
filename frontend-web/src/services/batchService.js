import api from "./api";

export const getBatches = () => api.get("/batches");
export const createBatch = (payload) => api.post("/batches", payload);
export const updateBatch = (id, payload) => api.put(`/batches/${id}`, payload);
export const deleteBatch = (id) => api.delete(`/batches/${id}`);
