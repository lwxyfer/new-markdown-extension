import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: false, // Disable minification for debugging
    rollupOptions: {
      input: resolve(__dirname, 'src/core/webview.tsx'),
      output: {
        format: 'iife',
        name: 'MarkdownEditor',
        entryFileNames: 'webview.js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})