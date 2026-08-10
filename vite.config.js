import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion') || id.includes('motion')) return 'motion'
            if (id.includes('phosphor-react')) return 'icons'
            if (id.includes('react-router')) return 'router'
            if (id.includes('react-dom') || id.includes('react/')) return 'react'
            return 'vendor'
          }
        },
      },
    },
  },
})