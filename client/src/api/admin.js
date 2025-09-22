// src/api/admin.js
import axios from "axios";

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api" });

// attach token automatically if stored
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// fetch overview data
export const getOverview = () => API.get("/admin/overview");
