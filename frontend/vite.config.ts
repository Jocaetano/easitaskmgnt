import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/tasks': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
  },
})
