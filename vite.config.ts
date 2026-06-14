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
            // 음성 교체(남성→여성) 시 파일명이 같아 옛 캐시가 재생되므로 캐시명을 올려 새로 받게 함
            cacheName: 'tts-audio-v2',
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
