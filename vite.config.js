import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-404',
      closeBundle() {
        const index = resolve(__dirname, 'dist/index.html')
        copyFileSync(index, resolve(__dirname, 'dist/404.html'))
      },
    },
  ],
  base: process.env.NODE_ENV === 'production' ? '/gregs-word-game/' : '/',
})
