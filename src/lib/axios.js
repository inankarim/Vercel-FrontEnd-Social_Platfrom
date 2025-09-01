import axios from "axios";

// Create axios instance with correct configuration
export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout (increased from 10 seconds)
  headers: {
    'Content-Type': 'application/json',
  }
});
