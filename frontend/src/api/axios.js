// One shared axios instance for every API call.
import axios from "axios";

const api = axios.create({
  // Dev: "/api" is proxied to the backend by Vite. Prod: set VITE_API_URL.
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach the JWT (saved at login) to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is expired/invalid the API answers 401 -> log the user out.
// (Login itself also returns 401 for wrong passwords, so it is excluded.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Turns seconds into "14 min 59 sec" for the rate-limit message.
const formatWait = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min${s ? ` ${s} sec` : ""}` : `${s} sec`;
};

// Gets a readable message out of any axios error.
// For 429 (rate limited) it adds how long the user must wait.
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error.response?.data;
  if (error.response?.status === 429 && data?.retryAfter) {
    return `${data.message} Try again in ${formatWait(data.retryAfter)}.`;
  }
  return data?.message || fallback;
}

export default api;
