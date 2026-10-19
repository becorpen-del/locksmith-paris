import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Multi-page build: without this, Vite only outputs index.html and the
// legal pages (privacy, cookies, legal notice, price list) return 404.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        cookies: resolve(import.meta.dirname, 'cookies.html'),
        legalNotice: resolve(import.meta.dirname, 'legal-notice.html'),
        priceList: resolve(import.meta.dirname, 'price-list.html'),
      },
    },
  },
})
