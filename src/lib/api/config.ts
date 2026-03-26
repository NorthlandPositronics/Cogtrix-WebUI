export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8000";

export const API_V1 = `${API_BASE_URL}/api/v1`;
export const WS_V1 = `${WS_BASE_URL}/ws/v1`;
