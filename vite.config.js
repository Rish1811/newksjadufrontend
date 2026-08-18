import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:5000'

  return {
    plugins: [react()],

    server: {
      port: 5173,
      // host: true binds 0.0.0.0, so phones and other machines on the same
      // Wi-Fi can open the site at http://<your-lan-ip>:5173
      host: true,
      proxy: {
        // Same-origin API calls in dev: no CORS, and no hardcoded localhost
        // that would break when the page is opened from another device.
        '/api': { target: proxyTarget, changeOrigin: true },
        '/uploads': { target: proxyTarget, changeOrigin: true },
      },
    },

    preview: { port: 4173, host: true },

    build: {
      target: 'es2020',
      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          // Split rarely-changing vendor code into its own chunks so a code
          // change doesn't force users to re-download React on every deploy.
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            icons: ['lucide-react'],
          },
        },
      },
    },

    // Pre-bundle these once at dev-server start instead of on first request.
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
})
