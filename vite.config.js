import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    exclude: ['argon2-browser'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext'
  }
})