import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({ baseURL: BASE, timeout: 30000 });

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("optivest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (e) => Promise.reject(new Error(e.response?.data?.detail || e.message || "Request failed"))
);

export const authApi = {
  signup: async ({ name, email, phone, password }) => {
    const { data } = await client.post("/auth/signup", { name, email, phone, password });
    return data; // { token, user }
  },

  login: async (identifier, password) => {
    const { data } = await client.post("/auth/login", { identifier, password });
    return data; // { token, user }
  },

  getProfile: async () => {
    const { data } = await client.get("/auth/profile");
    return data;
  },

  updateProfile: async (updates) => {
    const { data } = await client.put("/auth/profile", updates);
    return data;
  },

  changePassword: async (current_password, new_password) => {
    const { data } = await client.put("/auth/change-password", { current_password, new_password });
    return data;
  },
};
