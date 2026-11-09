import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from /new/ next to the classic dashboard until the switch-over.
export default defineConfig({
  base: process.env.DASHBOARD_BASE || "/new/",
  plugins: [react(), tailwindcss()],
});
