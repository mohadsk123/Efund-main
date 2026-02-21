import axios from "axios";

function buildBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL ?? "").toString().trim();
  // If user provided a full base URL that already contains '/api', use as-is (after trimming trailing slash)
  if (raw) {
    const cleaned = raw.replace(/\/+$/, "");
    if (/\/api$/i.test(cleaned)) {
      return cleaned; // already ends with /api
    }
    return `${cleaned}/api`;
  }
  // Default to local backend root with appended /api
  return "http://localhost:5000/api";
}
const API_BASE_URL = buildBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

apiClient.interceptors.request.use((config) => {
  const session = localStorage.getItem("efund_session");
  if (session) {
    const { token } = JSON.parse(session);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;
