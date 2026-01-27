import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configured for standard React/Vite deployment
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    strictPort: true,
  }
})
