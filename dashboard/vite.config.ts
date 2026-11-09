import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served at the root of panel/dashboard.khatooncollection.in. Pages not rebuilt
// yet are still served by the classic dashboard on the same domain, whose files
// live in /assets, so this app's files go to /app-assets.
export default defineConfig({
  base: "/",
  build: { assetsDir: "app-assets" },
  plugins: [react(), tailwindcss()],
});
