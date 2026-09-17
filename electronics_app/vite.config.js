import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind CSS v4 — no tailwind.config.js needed; the design system
    // (tokens, glass/shimmer utilities) lives in src/index.css.
    tailwindcss(),
  ],
  server: {
    host: true, // 0.0.0.0 so the app is reachable outside the sandbox
    // Allow whatever host the dev server is viewed through (preview hosts,
    // tunnel domains, …). Vite 8 blocks unknown hosts by default.
    allowedHosts: true,
    proxy: {
      // When VITE_API_URL is NOT set, the app calls same-origin /api/* —
      // proxy those to a local API (your real backend or mock/server.mjs).
      // When VITE_API_URL IS set, requests go directly to that origin and
      // this proxy is never used, so your existing setup is unaffected.
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
