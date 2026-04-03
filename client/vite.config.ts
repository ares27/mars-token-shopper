import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  build: {
    // Increase the limit slightly for professional apps
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // This splits your node_modules into a separate 'vendor' chunk
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "firebase";
            if (id.includes("lucide-react")) return "icons";
            return "vendor";
          }
        },
      },
    },
  },
});
