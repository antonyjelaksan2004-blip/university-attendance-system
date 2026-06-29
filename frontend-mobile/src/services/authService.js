import api from "./api";

export const loginUser = (payload) => api.post("/auth/login", payload);
export const forgotPassword = (payload) => api.post("/auth/forgot-password", payload);
export const verifyOtp = (payload) => api.post("/auth/verify-otp", payload);
export const resetPassword = (payload) => api.post("/auth/reset-password", payload);
