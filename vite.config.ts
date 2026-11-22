import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' => funciona en cualquier repo de GitHub Pages (usuario.github.io/NOMBRE-REPO/)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', assetsDir: 'assets' },
})
