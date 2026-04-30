import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Tự động cập nhật service worker khi có phiên bản mới
      registerType: "autoUpdate",

      // Kích hoạt PWA ngay cả khi đang chạy lệnh 'npm run dev'
      devOptions: {
        enabled: true,
        type: "module",
      },

      // Các file tĩnh trong thư mục public cần được cache trước
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "mask-icon.svg",
        "locales/**/*.json", // Quan trọng cho đa ngôn ngữ
      ],

      manifest: {
        name: "Food-Map VIP",
        short_name: "FoodMap",
        description: "Khám phá ẩm thực đường phố ngay cả khi không có mạng",
        theme_color: "#ea580c",
        background_color: "#ffffff",
        start_url: "/",
        display: "standalone", // Hiện thị như app độc lập (mất thanh địa chỉ trình duyệt)
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", // Giúp icon đẹp trên Android
          },
        ],
      },

      workbox: {
        // Cache toàn bộ code build và các file assets
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,json}", // Đã bao gồm các file json cơ bản
          "locales/**/*.json", // Thêm dòng này để chắc chắn toàn bộ file dịch được lưu offline
        ],

        // Cấu hình lưu trữ cho các tài nguyên bên ngoài (External APIs/CDNs)
        runtimeCaching: [
          // 1. Cache ảnh từ Unsplash
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "external-images-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 2. Cache ảnh từ Vinpearl
          {
            urlPattern: /^https:\/\/statics\.vinpearl\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "vinpearl-images",
              expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 3. Cache Audio và Ảnh từ Cloudinary (Dành cho Audio thuyết minh)
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "cloudinary-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              fetchOptions: {
                mode: "cors",
              },
              cacheableResponse: {
                statuses: [0, 200], // Status 0 cực kỳ quan trọng cho request CORS từ Cloudinary
              },
            },
          },
          // 4. Cache mảnh bản đồ OpenStreetMap (Offline Map)
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "leaflet-map-tiles",
              expiration: {
                maxEntries: 1000, // Tăng lên nếu khu vực bản đồ rộng
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],

  // Cấu hình server để hỗ trợ ngrok và proxy backend
  server: {
    host: true,
    port: 5173,
    allowedHosts: true, // Cho phép ngrok truy cập
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
