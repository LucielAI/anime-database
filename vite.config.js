import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    mode === 'production' && process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-report.html',
      open: true,
      gzipSize: true,
    }),
  ].filter(Boolean),
  test: {
    environment: 'node',
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
          if (id.includes('node_modules/d3-force')) {
            return 'vendor-d3'
          }
          if (id.includes('@vercel/speed-insights') || id.includes('@vercel/analytics')) {
            return 'vendor-telemetry'
          }
        }
      }
    }
  }
}))
