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
  // Compile-time constants, so builds drop code that's switched off instead of shipping unused chunks.
  define: {
    // Preview-only demo of the digital model flow (no AI).
    __AVATAR_DEMO__: JSON.stringify(process.env.VITE_AVATAR_DEMO === "1"),
    // /digital-twin-test prototype: on unless VITE_DIGITAL_TWIN_TEST=0. Turn it off before launch.
    __TWIN_TEST__: JSON.stringify(process.env.VITE_DIGITAL_TWIN_TEST !== "0"),
    // Only the shareable design preview sets this (its own build config); never on in the app.
    __TWIN_SIMULATOR__: "false",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
