import axios from "axios";
import { auth } from "../config/firebase";

// TODO: Replace with your actual backend URL...
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://nxthyre-server-staging-863630644667.asia-south1.run.app/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access - redirecting to login");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
