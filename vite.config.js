import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

let buildOutDir = resolve(process.cwd(), 'dist')

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-404',
      configResolved(config) {
        buildOutDir = resolve(config.root, config.build.outDir)
      },
      closeBundle() {
        const index = resolve(buildOutDir, 'index.html')
        const fallback = resolve(buildOutDir, '404.html')
        if (existsSync(index)) {
          copyFileSync(index, fallback)
        }
      },
    },
  ],
  base: process.env.NODE_ENV === 'production' ? '/AlphaDelta/' : '/',
})
