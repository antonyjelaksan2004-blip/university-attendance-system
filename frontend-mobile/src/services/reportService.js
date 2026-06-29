import api from "./api";

export const getDashboardSummary = () => api.get("/reports/dashboard");
export const getDeletedRecords = () => api.get("/reports/deleted-records");
