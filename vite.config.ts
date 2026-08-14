import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/price-api': {
        target: 'https://api.spoons.cheap',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/price-api/, ''),
      },
    },
  }
})
