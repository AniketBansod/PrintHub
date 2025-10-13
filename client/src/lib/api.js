// Base API URL: use VITE_API_URL when set, otherwise rely on Vite dev proxy ("/api" relative)
export const API = (import.meta?.env?.VITE_API_URL || "").replace(/\/$/, "");

export const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getJSON = async (path, options = {}) => {
  const base = API || "";
  const res = await fetch(`${base}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};


