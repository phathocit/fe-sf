import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa"; // Thêm dòng này

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 1. Tự động cập nhật ứng dụng khi bạn có thay đổi code mới
      registerType: "autoUpdate",

      // 2. Những loại file sẽ được "cất vào kho" để chạy offline
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],

      // 3. Cấu hình Manifest
      manifest: {
        name: "Food-Map VIP",
        short_name: "FoodMap",
        description: "Khám phá ẩm thực đường phố ngay cả khi không có mạng",
        theme_color: "#ea580c",
        icons: [
          {
            src: "pwa-192x192.png", // Bạn cần tạo ảnh này trong thư mục public
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png", // Bạn cần tạo ảnh này trong thư mục public
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      // 4. Chiến lược lưu trữ (Workbox)
      workbox: {
        // Lưu trữ tất cả file giao diện (CSS, JS, HTML)
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],

        // Cấu hình để cache cả các file từ bên ngoài (như Google Fonts hoặc ảnh từ Unsplash)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "external-images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // Lưu trong 30 ngày
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leaflet-map-tiles',
              expiration: {
                maxEntries: 500, // Lưu tối đa 500 mảnh bản đồ
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 ngày
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
