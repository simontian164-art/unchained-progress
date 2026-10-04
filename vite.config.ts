import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  // Preview-only demo of the digital model flow (no AI). A compile-time constant, so production
  // builds drop the demo code entirely instead of shipping an unused chunk.
  define: {
    __AVATAR_DEMO__: JSON.stringify(process.env.VITE_AVATAR_DEMO === "1"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
