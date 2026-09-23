import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vueJsx(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Find My Barber",
        short_name: "FMB",
        description: "Explore and book your next barber",
        theme_color: "#18181b",
        background_color: "#18181b",
        display: "standalone",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});