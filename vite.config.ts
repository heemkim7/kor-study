import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        // 음성(mp3)은 프리캐시 대신 런타임 캐시(설치 가벼움, 재생 시 캐시, 오프라인 미캐시 시 브라우저 TTS 폴백)
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,woff2}'],
        runtimeCaching: [{
          urlPattern: /\/audio\/.*\.mp3$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'tts-audio',
            expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 60 },
            cacheableResponse: { statuses: [200] },
          },
        }],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
