import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development every request to /api is forwarded to the Express backend,
// so the browser never hits CORS problems and no API URL is hard-coded.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
