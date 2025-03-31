import axios from "axios";

const API = axios.create({ 
    baseURL: "https://animated-umbrella-rj4q57x96wfp96v-5000.app.github.dev/api"
  });

// Add request interceptor to include the auth token in all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;