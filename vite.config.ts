import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      mode === 'development' ? basicSsl() : undefined,
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
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: true,
      proxy: {
        '/ws': {
          target: 'ws://127.0.0.1:3001',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
