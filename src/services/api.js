import axios from "axios";
import mockApi from "./mockApi";

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true" || import.meta.env.DEV;

const axiosApi = axios.create({
  baseURL: "https://foundation-api.hsp.ovh/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosApi.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

const API = useMockApi ? mockApi : axiosApi;

export default API;
