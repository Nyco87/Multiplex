import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { licensesPlugin } from './scripts/licenses'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'))

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: { input: resolve(__dirname, 'src/renderer/index.html') }
    },
    define: { __APP_VERSION__: JSON.stringify(pkg.version) },
    plugins: [react(), licensesPlugin(__dirname)]
  }
})
