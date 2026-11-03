import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// base "./" permite desplegar en GitHub Pages (subcarpeta) sin romper las rutas.
export default defineConfig({
  base: "./",
  plugins: [vue()],
});
