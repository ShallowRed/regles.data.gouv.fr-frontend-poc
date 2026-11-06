import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: fileURLToPath(new URL('dist', import.meta.url)),
    lib: {
      entry: fileURLToPath(new URL('rule-form-element.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'regle-formulaire.js',
      cssFileName: 'regle-formulaire',
    },
  },
})
