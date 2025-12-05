import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import topLevelAwait from 'vite-plugin-top-level-await'

// Plugin pour injecter le CSP dans le HTML
const cspHtmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      const csp = "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3000 ws://localhost:5173 ws://localhost:5174; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`
      );
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    topLevelAwait(),
    cspHtmlPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    include: ['argon2-browser'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
    }
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    },
    fs: {
      allow: ['..']
    },
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3000 ws://localhost:5173 ws://localhost:5174; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/*.config.ts',
        '**/vite-env.d.ts'
      ]
    }
  }
})