import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'

export default defineConfig(() => {
  return {
    plugins: [
      mkcert(),
      tailwindcss(),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true, // Aceitar conexões da rede local (0.0.0.0)
      proxy: {
        '/ws': {
          target: 'ws://127.0.0.1:3001',
          ws: true
        },
      },
    },
    preview: {
      host: true,
      proxy: {
        '/ws': {
          target: 'ws://127.0.0.1:3001',
          ws: true
        },
      },
    },
  };
})
