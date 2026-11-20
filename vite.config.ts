import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/al-azhar-tex/',
  build: {
    outDir: 'dist',
  },
})
